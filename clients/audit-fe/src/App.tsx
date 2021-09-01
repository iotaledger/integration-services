import React, { useState, useEffect } from 'react';
import './App.css';
import { getChannelData } from './fetch-channel';

function App() {
  const [data, setData] = useState<{messageId:string;link:string;channelLog:any}[]>([]);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect( () => {
    const getChannelAsync = async () => {
      const d = await getChannelData(url)
      setData(d)
    }
    getChannelAsync()
  });

  const channelAddress= '83c3e542c545af3549b3d1b7229738fbe44bd1dd4960b1a8fe823e0653d7f3e60000000000000000:5cca4963d1d0a0230f0c6f72'
  const presharedKey = '58e03816911f441f6f91796eca182618'
  const url = `/api/v1/channels/history/${channelAddress}?preshared-key=${presharedKey}`
  const listItem = (log:any) => {
    const keys = Object.keys(log.channelLog)
    
    const values:any = Object.values(log.channelLog);
    const isObject = (v:any) => {return Object.keys(v).length>0};

    return keys.map((key,idx)=>  (<React.Fragment><div key={idx}>
          <div className="d-inline p-2 bg-primary text-white">{key}</div>
          <div className="d-inline p-2 bg-dark text-white">{isObject(values[idx]) ? JSON.stringify(values[idx]): values[idx]}</div>
        </div></React.Fragment>)
    )
  }
  return (
    <div className="App">
      <ul className="list-group">
        {
          data && data?.map((d,index) => {
            return (<React.Fragment><li className="list-group-item" key={index}> 
              <div><React.Fragment>{d && listItem(d)}</React.Fragment></div>
            </li></React.Fragment>)
          })
        }
      </ul>
    </div>
  );
}

export default App;
