import {memo} from "react";
import TaskPanel from '@/components/TaskPanel.tsx';

import content from '@/utils/content.ts';


const Lighting = () => {

  return (
    <TaskPanel buttonContentArray={content.lightingPanel.buttons}/>
  )
}


export default memo(Lighting);