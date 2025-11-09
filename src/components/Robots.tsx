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
import {Form} from "react-bootstrap";

interface ConnectedBot {
  name: string;
  controlling: boolean;
}


const Robots = () => {

  const [selectedTask, setSelectedTask] = useState<ControlTask | null>(null);

  // Whether spinner is showing
  const [showLoading, setShowLoading] = useState<boolean>(false);

  const [connectedBots, setConnectedBots] = useState<ConnectedBot[]>([]);

  const [refreshButtonIsRotated, setRefreshButtonIsRotated] = useState<boolean>(false);

  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

  const spinnerTimerRef = useRef<NodeJS.Timeout>(null);

  const selectButton = async (buttonContent: TileButtonContent) => {
    if (buttonContent.taskId) {
      const selectedBots = connectedBots.filter(bot => bot.controlling);
      if (selectedBots.length === 0) {
        // Any button press is invalid if no bots are selected for control
        return;
      }
      const selectedClientIds = (
        (selectedBots.length < connectedBots.length) ?
          selectedBots.map(bot => `kin-${bot.name}`) :
          []
      );

      const task = tasksMap.get(buttonContent.taskId)!;
      setSelectedTask(task);
      await runAction('task', buttonContent.taskId, selectedClientIds);
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

  const getConnectedBots = useCallback(async () => {
    setRefreshButtonIsRotated(!refreshButtonIsRotated);
    try {
      const response = await fetch('/api/names');
      if (!response.ok) {
        console.error(`API error fetching names: ${response}`);
        return;
      }
      const data: NamesResponse = await response.json();
      if ('names' in data) {
        setConnectedBots(data.names.map(name => ({name: name, controlling: true})));
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
    disabled: buttonsDisabled
  }));

  const handleBotsSwitchChange = useCallback((name: string) => {
    setConnectedBots(connectedBots.map(bot => {
      if (bot.name == name) {
        return {name: bot.name, controlling: !bot.controlling};
      } else {
        return bot;
      }
    }));
  }, [connectedBots]);

  useEffect(() => {
    setButtonsDisabled(!connectedBots.some(bot => bot.controlling));
  }, [connectedBots]);

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
        <Button className={'ms-2'} size={'sm'} onClick={getConnectedBots}>
          <i className={"bi bi-arrow-clockwise " + (refreshButtonIsRotated ? 'rotate-icon' : '')}></i>
        </Button>
      </h5>
      <Table borderless>
        <tbody>
        {connectedBots.map((connectedBot, index) => (
          <tr key={index}>
            <td className={'col-8'}>kin-{connectedBot.name}</td>
            <td className={'col-2'}>
              <Form>
                <Form.Check
                  type="switch"
                  id="custom-switch" // Unique ID for the switch
                  label=""
                  checked={connectedBot.controlling} // Controlled by the state
                  onChange={() => handleBotsSwitchChange(connectedBot.name)} // Handles state updates
                />
              </Form>
            </td>
            <td className={'col-2'}>
              {connectedBot.controlling ?
                <i className={"bi bi-check-square-fill "} style={{color: '#00ae10'}}></i> :
                <i className={"bi bi-slash-square-fill"} style={{color: '#ffa600'}}></i>}
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
    </ButtonPanel>
  );
};

export default memo(Robots);