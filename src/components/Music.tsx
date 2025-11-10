import {memo} from "react";
import TaskPanel from '@/components/TaskPanel.tsx';

import content from '@/utils/content.ts';


const Music = () => {

  return (
    <TaskPanel buttonContentArray={content.musicPanel.buttons}/>
  )
}


export default memo(Music);