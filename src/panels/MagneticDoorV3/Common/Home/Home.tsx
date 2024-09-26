import React, { useEffect, useState } from 'react';
import { Battery } from '@custom/Battery';
import { Icon } from '@custom/Icon';
import { Disk } from './Disk';
import dayjs from 'dayjs';
import sdk from 'qcloud-iotexplorer-h5-panel-sdk';
import { Cell } from '@custom/Cell';
import { OptionDialog } from '@custom/OptionDialog';
import classNames from 'classnames';
import { CellBtn } from '@components/Btn/CellBtn';
import { t } from '@locales';

export function Home({
  deviceData,
  doControlDeviceData,
  history: { PATH, push },
}) {
  const isAlarmOpen = deviceData.temperAlarm === 1;
  const [recordTime, setRecordTime] = useState('');
  const [recordStatus, setRecordStatus] = useState('');

  useEffect(() => {
    // 获取历史记录
    const getDeviceDataHistory = async () => {
      try {
        const time = new Date();
        const currentTime = new Date().getTime();
        const lastYear = new Date().getFullYear() - 1;
        const lastYearTime = time.setFullYear(lastYear);

        const recordListInfo = await sdk.getDeviceDataHistory({
          FieldName: 'contact_state',
          MaxTime: currentTime,
          MinTime: lastYearTime,
          Limit: 1,
        });
        setRecordTime(recordListInfo.Results[0]?.Time || '');
        setRecordStatus(recordListInfo.Results[0]?.Value || '');
      } catch (err) {
        console.error('get info fail', err);
      }
    };
    getDeviceDataHistory();
  });

  // 获取时间
  const date = dayjs(Number(recordTime));

  const statusLabel: any = {
    0: t('关闭'),
    1: t('打开'),
  };

  const [visible, setVisible] = useState(false);

  const recordStatusText = recordStatus ? `${date.format('YYYY-MM-DD HH:mm')} ${statusLabel[Number(recordStatus)] ? statusLabel[Number(recordStatus)] : t("未知")}` : t("暂无记录");

  // const renderAlarmDom = () => {
  //   return (<>
  //     <div className="title">防拆警报</div>
  //     <Icon name="alarm" />
  //     <Cell title={isAlarmOpen ? '开启' : '关闭'} ele="switch" isLink={false} eleValue={isAlarmOpen} onChange={(val) => {
  //       doControlDeviceData({ 'temperAlarm': !val ? 0 : 1 });
  //     }} />
  //   </>);
  // }
  return (
    <main className={classNames('home')}>
      {/* 顶部 */}
      <header>
        {/* 电源模块 */}
        {/* 电源模块 */}
        <Battery
          value={deviceData?.voltage || 50}
          isShowPercent={true}
          isShowTip={false}
        />
      </header>
      <div className='switch-block' style={{ display: 'none' }}>
        <Icon name='switch' />
      </div>
      <Disk deviceData={deviceData} doControlDeviceData={doControlDeviceData}></Disk>
      <div className='tips'
           style={{ left: `calc(50% - ${(document.querySelector('.tips')?.clientWidth || 0) / 2}px)` }}>
        <span>
          {recordStatusText}
        </span>
      </div>
      {/* 设置按钮 */}
      <div className='setting-block action'>
        <div
          key='temper-alarm'
          className={`action-item  ${isAlarmOpen ? 'checked' : ''} action-item-1`}
        >
          {/* <div className={`action-ele action-ele-1 dialog`} style={{ display: 'none' }} onClick={() => {
            setVisible(true);
          }}>
            {renderAlarmDom()}
          </div> */}
          <div className={'action-ele action-ele-1'}>
            <div className='title'>{t('防拆警报')}</div>
            <Icon name='alarm' />
            <Cell title={isAlarmOpen ? t('开启') : t('关闭')} ele='switch' isLink={false} eleValue={isAlarmOpen}
                  onChange={(val) => {
                    doControlDeviceData({ temperAlarm: !val ? 0 : 1 });
                  }} />
          </div>
        </div>

        <div
          key='log-record'
          className={'action-item  action-item-2'}
          onClick={() => {
            push(PATH.RECORD);
          }}
        >
          <div className={'action-ele action-ele-1'}>
            <div className='title'>{t('日志')}</div>
            <Icon name='record' />
            <Cell title={t('更多记录')} ele='' isLink={true} onClick={() => {
              push(PATH.RECORD);
            }} />
          </div>
        </div>
      </div>
      <CellBtn
        onClick={() => {
          sdk.goScenePage({
            sceneType: 'auto',
            scenePreset: {
              Conditions: [
                {
                  CondType: 0,
                  Property: {
                    ProductId: sdk.productId,
                    DeviceName: sdk.deviceName,
                    PropertyId: 'contact_state',
                    Op: 'eq',
                    Value: 1,
                  },
                },
              ],
              freezeCondition: false,
            },
          });
        }}
      >
        {t('智能场景')}
      </CellBtn>
      <OptionDialog
        title={t('模式')}
        visible={visible}
        value={[deviceData?.temperAlarm || 0]}
        onCancel={() => setVisible(false)}
        onConfirm={(val) => {
          doControlDeviceData({ temperAlarm: val?.[0] * 1 });
          // onAllSwitchChange(val?.[0] * 1);
        }}
        options={[
          { label: t('打开'), value: 1 },
          { label: t('关闭'), value: 0 },
        ]}
      />
    </main>
  );
}
