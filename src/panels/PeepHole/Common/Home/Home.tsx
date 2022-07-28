import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Battery } from '@custom/Battery';
import { Cell } from '@custom/Cell';
import { Icon } from '@custom/Icon';
import { Disk } from './Disk';
import sdk from 'qcloud-iotexplorer-h5-panel-sdk';
import { useTitle } from '@hooks/useTitle';
import { Popup } from '@custom/Popup';
import { LogList } from '../Log/LogList';
import { StatusTip } from '@src/components/StatusTip';

const lockStatusWord = {
  0: '未上锁',
  1: '已上锁',
  2: '已离线',
};

const lockStatus = {
  0: 'unlocked',
  1: 'locked',
  2: 'offline',
};

export function Home({
  deviceData,
  productInfo,
  doControlDeviceData,
  offline,
  templateMap,
  history: { PATH, push },
  tips,
}) {
  useTitle(productInfo.Name ? productInfo.Name : '首页');
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (offline) {
      sdk.offlineTip.show();
    } else {
      sdk.offlineTip.hide();
    }
  }, [offline]);

  // 门锁状态
  const status = useMemo(() => {
    if (offline) return 2;
    return deviceData.lock_motor_state || 0;
  }, [offline, deviceData]);

  return (
    <main className="home">
      {/* 顶部 */}
      <header className="header-wrap">
        <div className="header-left">
          {/* 门锁电源模块 */}
          <div>
            <Battery
              value={deviceData.battery_percentage || 0}
              isShowPercent={true}
              isShowTip={false}
            />
            <label>门锁电池</label>
          </div>
        </div>
        <div className="middle-wrap" style={{ padding: 0 }}>
          <div className={classNames(
            'status-tip',
            lockStatus[status],
          )}>{lockStatusWord[status]}</div>
        </div>

        {/* 更多 */}
        <div
          className="header-right"
          onClick={() => {
            push(PATH.SETTINGS_INDEX);
          }
        }>
          <Icon name='more'></Icon>
        </div>
      </header>
      {/* 表盘 */}
      <Disk
        deviceData={deviceData}
        offline={offline}
        doControlDeviceData={doControlDeviceData}
        tips={tips}
      ></Disk>

      {/* 设置按钮 */}
      <div className="setting-block">
        <Cell
          className="cell-border"
          title="日志"
          prefixIcon={<Icon name="log"/>}
          size="medium"
          onClick={() => {
            push(PATH.LOG);
          }}
        >
          <LogList
            style={{ paddingTop: '20px' }}
            emptyTip={
              <div className="empty-tip">暂无数据</div>
            }
            hideTitle
            logType={'action'}
            activeKey="action"
            limit={3}
            dateTime={[new Date(), new Date]}
            templateMap={templateMap}
          />
        </Cell>
      </div>
      <footer className='footer'>
        <div
          onClick={() => {
            push(PATH.USERS_INDEX);
          }}
        >用户管理</div>
        <div className='split-line'></div>
        <div
          onClick={() => {
            push(PATH.TEMP_PASSWORD_INDEX);
          }}
        >临时密码</div>
      </footer>
      <Popup
        visible={visible}
        onMaskClick={() => setVisible(false)}
      >
        <div className="pop-content">
          内容
        </div>
      </Popup>
    </main>
  );
}
