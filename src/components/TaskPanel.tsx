import {memo, useState, useRef, useEffect, useCallback} from "react";
import ButtonPanel, {type TileButtonProps} from '@/components/ButtonPanel.tsx';

import content, {tasksMap} from '@/utils/content.ts';
import type {TileButtonContent, ControlTask} from "@/data/schema.ts";
import {runAction} from "@/utils/utils.ts";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";


interface TaskPanelProps {
  buttonContentArray: TileButtonContent[];
}

const TaskPanel = (props: TaskPanelProps) => {

  const [selectedTask, setSelectedTask] = useState<ControlTask | null>(null);

  // Whether spinner is showing
  const [showLoading, setShowLoading] = useState<boolean>(false);

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
  }

  const buttonData: TileButtonProps[] = props.buttonContentArray.map((buttonContent: TileButtonContent) => ({
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
    </ButtonPanel>
  )
}


export default memo(TaskPanel);