import './config/index'
import React, { useState, useEffect } from 'react';
import './App.css';
import { getChannelData } from './fetch-channel';
import ReactJson from 'react-json-view'
import { Config } from './config';

function App() {
  const [data, setData] = useState<{messageId:string;link:string;log:any}[]>([]);

  useEffect(() => {
    const channelAddress= Config.channelAddress
    const presharedKey = Config.presharedKey
    const url = `/api/v1/channels/history/${channelAddress}?preshared-key=${presharedKey}`
  
    const getChannelAsync = async () => {
      console.log('requesting channel data');
      const d = await getChannelData(url)
      setData(d)
    }
    const interval = setInterval(async() => {
      await getChannelAsync();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

 
  return (
    <div className="App">
      <ul className="list-group">
      
        <li className="list-group-item  list-group-item-primary" key={'ch-address'}>
         <div className="ms-2 me-auto">
            <div>Channeladdress:</div><div className="fw-bold">{Config.channelAddress}</div>
          </div>
        </li>
        {
          data && data?.map((d,index) => {
            return (<li className="list-group-item" key={index}> 
              <ReactJson key={index} src={d} enableClipboard={false} displayDataTypes={false} displayObjectSize={false} />
            </li>)
          })
        }
      </ul>
    </div>
  );
}

export default App;
