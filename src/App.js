import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './App.css'; // 导入 CSS 文件
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './Component/Login';
import Register from './Component/Register';
import Choose from './Component/Choose';
import AnalysisModule from './Component/AnalysisModule';
import CreateModule from './Component/CreateModule';
import PatientManagement from './Component/AnalysisModule/PatientManagement';
import { useSelector } from 'react-redux';
function App() {
    
    return (
        <Provider store={store}>
        <Router>
            <div>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/choose" element={<Choose />} />
                    <Route path="/analysisModule" element={<AnalysisModule />} />
                    <Route path="/createModule" element={<CreateModule />} />
                    <Route path="/" element={<Login />} /> {/* 首页显示登录 */}
                </Routes>
            </div>
        </Router>
        </Provider>
        
    );
}

export default App;
