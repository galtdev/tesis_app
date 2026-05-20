import { Outlet } from "react-router-dom";
import { useState } from "react";
import '../styles/styles.css'


export default function ClientMenuLayout() {


    

    const [orderData, setOrderData] = useState({
        step1:[], // platillos
        step2:{}, // pedido
        step3:{} // pagos

        
    });
        
    const updateOrder = (step, data) => {
        setOrderData(prev => ({
        ...prev,
        [step]: data
    }));
    };
        
    const resetOrder = () => {
        setOrderData({step1: [], step2: {}, step3: {}});
    }
        
        


    return(
        <div className="main-container">
            
            <Outlet context={{orderData, updateOrder, resetOrder}}/>
        </div>
    );
}

