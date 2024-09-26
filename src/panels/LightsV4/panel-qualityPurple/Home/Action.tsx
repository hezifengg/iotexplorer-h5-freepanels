import React, { useState, useRef } from 'react';
import { Icon } from '@custom/Icon';
import { Cell } from '@custom/Cell';
import { CountDown } from '../../Common/CountDown';
import { t } from '@locales';

const Action = (props) => {

  const {
    deviceData: { power_switch, count_down },
    history: { PATH, push },
    timer: { isExistTimer },
    doControlDeviceData,
  } = { ...props };
  const onSwitchChange = () => {
    doControlDeviceData({ power_switch: power_switch ? 0 : 1 });
  };

  const countRef = useRef(null);
  const isSwitchOff = power_switch !== 1;
  const actionCls = isSwitchOff ? 'action-off' : '';

  const actions = [
    // [
    //   '总控开关',
    //   isSwitchOff ? '关闭' : '开启',
    //   onSwitchChange,
    //   !!power_switch,
    //   'switch'
    // ],
    [
      t('定时器'),
      isSwitchOff ? 'timing' : 'timing-checked',
      !!count_down ? push.bind(null, PATH.TIMER_COUNTDOWNPAGE, { value: count_down }) : () => { countRef.current.onOpen() },
      isExistTimer,
      ''
    ],
  ];
  return (
    <>
      <div className={`action action-off`}>
        {actions.map(([label, name, onClick, isChecked, ele], index) => (
          <div
            key={name}
            className={`action-item  ${isChecked ? 'checked' : ''} action-item-${index + 1
              }`}
            onClick={onClick}
          >
            <div className={`action-ele action-ele-${index}`}>
              {/* <div>{label}</div> */}
              <Icon name={name} />
              <div>{label}</div>
            </div>
          </div>
        ))}
      </div>
      <CountDown
        ref={countRef}
        {...props}
        isModal={false}
        isPopUp={true}
      />
    </>

  );
};

export default Action;
