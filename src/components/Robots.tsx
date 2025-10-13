import {memo, useState} from "react";
import ButtonPanel, {type TileButtonProps} from '@/components/ButtonPanel.tsx';

import content from '@/utils/content.ts';
import type {TileButtonContent} from "@/data/schema.ts";
import {runAction} from "@/utils/utils.ts";
import Badge from "react-bootstrap/Badge";

const Robots = () => {

  const [selectedTask, setSelectedTask] = useState<string>('');

  const selectButton = async (buttonContent: TileButtonContent) => {
    if (buttonContent.taskId) {
      setSelectedTask(buttonContent.taskId);
      await runAction('task', buttonContent.taskId);
    }
  };

  const buttonData: TileButtonProps[] = content.robotsPanel.buttons.map((buttonContent: TileButtonContent) => ({
    title: buttonContent.title,
    iconName: buttonContent.iconName,
    variant: buttonContent.variant,
    callback: () => selectButton(buttonContent),
    disabled: false
  }));

  return (
    <ButtonPanel buttonPropsArray={buttonData}>
      <strong>Task: </strong><br/>
      <Badge bg={'primary'}>{selectedTask}</Badge>
    </ButtonPanel>
  );
};

export default memo(Robots);