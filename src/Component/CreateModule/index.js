import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateModule.css'; // 导入 CSS 文件
import { useDispatch, useSelector } from 'react-redux';
import { changeChooseNumber } from '../../store/stageSlice';
import NewPatient from '../AnalysisModule/NewPatient';

function CreateModule(){ 
    return(
        <div className='createBox'>
            <NewPatient/>   
        </div>

    )
}

export default CreateModule;