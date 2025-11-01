import {memo, useState, useRef, useEffect, useCallback} from "react";
import ButtonPanel, {type TileButtonProps} from '@/components/ButtonPanel.tsx';

import content, {tasksMap} from '@/utils/content.ts';
import type {TileButtonContent, ControlTask} from "@/data/schema.ts";
import {runAction, delay} from "@/utils/utils.ts";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import type {NamesResponse} from "@/types/api.ts";

import '@/styles/robots.css';


const Robots = () => {

  const [selectedTask, setSelectedTask] = useState<ControlTask | null>(null);

  // Whether spinner is showing
  const [showLoading, setShowLoading] = useState<boolean>(false);

  const [connectedNames, setConnectedNames] = useState<string[]>([]);

  const [refreshButtonIsRotated, setRefreshButtonIsRotated] = useState<boolean>(false);

  const spinnerTimerRef = useRef<NodeJS.Timeout>(null);

  const selectButton = async (buttonContent: TileButtonContent) => {
    if (buttonContent.taskId) {
      const task = tasksMap.get(buttonContent.taskId)!;
      setSelectedTask(task);
      await runAction('task', buttonContent.taskId);
    }
    setShowLoading(true);
    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current);
    }
    spinnerTimerRef.current = setTimeout(() => {
      setShowLoading(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
      }
    }
  }, []);

  const getConnectedNames = useCallback(async () => {
    setRefreshButtonIsRotated(!refreshButtonIsRotated);
    try {
      const response = await fetch('/api/names');
      if (!response.ok) {
        console.error(`API error fetching names: ${response}`);
        return;
      }
      const data: NamesResponse = await response.json();
      if ('names' in data) {
        setConnectedNames(data.names);
      }
    } catch (error) {
      console.error(error);
    }
  }, [refreshButtonIsRotated])

  useEffect(() => {
    const performRotateReset = async () => {
      await delay(350);
      setRefreshButtonIsRotated(false);
    }
    if (refreshButtonIsRotated) {
      performRotateReset();
    }
  }, [refreshButtonIsRotated]);

  const buttonData: TileButtonProps[] = content.robotsPanel.buttons.map((buttonContent: TileButtonContent) => ({
    title: buttonContent.title,
    iconName: buttonContent.iconName,
    variant: buttonContent.variant,
    callback: () => selectButton(buttonContent),
    disabled: false
  }));

  return (
    <ButtonPanel buttonPropsArray={buttonData}>
      <h5>
        <Badge bg={'success'} className={'me-2'}>TASK</Badge>
        {selectedTask && (showLoading ?
          <Spinner animation={'border'} size={'sm'} variant={'info'}/> :
          <i className="bi bi-check-lg" style={{color: '#00ae10'}}></i>)}
      </h5>
      <Alert variant={'light'}>
        {selectedTask ?
          <strong>{selectedTask.title ? selectedTask.title : selectedTask.id}</strong> :
          "None"}
      </Alert>
      <hr/>
      <h5>
        Connected
        <Button className={'ms-2'} size={'sm'} onClick={getConnectedNames}>
          <i className={"bi bi-arrow-clockwise " + (refreshButtonIsRotated ? 'rotate-icon' : '')}></i>
        </Button>
      </h5>
      <Table borderless>
        <tbody>
        {connectedNames.map((name, index) => (
          <tr key={index}>
            <td>kin-{name}</td>
            <td>
              <i className={"bi bi-check-lg "} style={{color: '#00ae10'}}></i>
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
    </ButtonPanel>
  );
};

export default memo(Robots);