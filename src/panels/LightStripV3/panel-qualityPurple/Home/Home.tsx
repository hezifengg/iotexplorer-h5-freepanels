import React, { useState, useEffect } from 'react';
import { Position } from '../../Common/Home/Position';
import LightBright from '../../Common/Home/LightBright';
import { ScenePage } from '../../Common/Home/Scene';
import Ticker from '../../Common/Home/Ticker';
import Action from './Action';
import { DeviceDetail } from '@custom/DeviceDetail';
import { Icon } from '@custom/Icon';
import { LightBright as ColorBright } from '@custom/LightBright';
import { getColorValue, getDegValue } from '@utils';
import { RgbColorPicker } from 'react-colorful';

const classList = {
  0: 'colour',
  1: 'white',
  4: 'sence'
};

export function Home(props) {
  // tab模式
  const { deviceData, colourMode, colour, doControlDeviceData } = props;
  const colorMode = props.deviceData.colourMode === undefined ? 1 : props.deviceData.colourMode;    // 0 彩色  1 白光  4 场景
  const isSwitchOff = props.deviceData.power_switch !== 1;
  const onSwitchChange = () => {
    props.doControlDeviceData({ power_switch: props.deviceData.power_switch ? 0 : 1 });
  };

  const [color, setColor] = useState({ r: 255, g: 255, b: 255 });
  useEffect(() => {
    const data = { r: colour?.red || 255, g: colour?.green || 255, b: colour?.blue || 255 }
    setColor(data);
  }, [colour]);
  return (
    <div className={`home ${classList[colorMode]}`}>
      <DeviceDetail></DeviceDetail>
      <Ticker {...props} />
      <div>
        {colorMode !== 4
          ? <div className="change-panel">
            <div className={`switch-btn`} onClick={onSwitchChange}>
              <Icon name={isSwitchOff ? "switch" : "switch-checked"} />
            </div>
            <div className={`color-list ${classList[colorMode]} ${isSwitchOff ? 'color-list-off' : ''}`}>
              {colorMode === 1 ? <ColorBright
                defaultValue={deviceData['whiteData']}
                status={deviceData.power_switch === 1}
                minValue={0}
                maxValue={359}
                onChange={(value, endTouch) => {
                  endTouch && doControlDeviceData('whiteData', getColorValue('white', parseInt(value)));
                }}
              ></ColorBright> : <RgbColorPicker color={color} onChange={(deg) => {
                setColor(deg);
                const data = {
                  red: deg.r,
                  green: deg.g,
                  blue: deg.b
                }
                doControlDeviceData('colour', data);
              }} />}
            </div>

            {colorMode === 1
              ? <LightBright
                iconName="brightness"
                controlName="brightness"
                {...props}
              ></LightBright>
              : null
            }
            {colorMode === 0
              ? <>
                <LightBright
                  iconName="temperature"
                  controlName="color_temp"
                  {...props}
                  minValue={2700}
                  maxValue={6000}
                  defaultValue={2700}
                ></LightBright>
                <LightBright
                  iconName="brightness"
                  controlName="brightness"
                  {...props}
                ></LightBright>
              </>
              : null
            }
          </div>
          : <ScenePage {...props}></ScenePage>
        }
        <Action {...props}></Action>
      </div>
    </div>
  );
}
