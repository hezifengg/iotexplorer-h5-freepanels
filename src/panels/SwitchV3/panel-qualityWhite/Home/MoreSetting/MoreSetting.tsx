import React, { useMemo } from 'react';
import { List, Picker, Switch, Toast } from 'antd-mobile';
import './MoreSetting.less';
import { useTitle } from '@hooks/useTitle';
import { getSwitchNum } from '@src/panels/SwitchV3/panel-qualityWhite/Home/Home';
import { useSwitchNameMap } from '@src/panels/SwitchV3/hooks/useSwitchNameMap';
import useSWR from 'swr';
import { t } from '@locales';

const outageStatusOptions = [
  [
    { label: t('关闭'), value: 0 },
    { label: t('记忆'), value: 1 },
  ],
];

const modeSwitchOptions = [
  [
    { label: t('开关模式'), value: 0 },
    { label: t('场景模式'), value: 1 },
  ],
];

const ledBrightnessOptions = [
  [
    { label: t('1级-亮度0%'), value: 1 },
    { label: t('2级-亮度10%'), value: 2 },
    { label: t('3级-亮度40%'), value: 3 },
    { label: t('4级-亮度60%'), value: 4 },
    { label: t('5级-亮度80%'), value: 5 },
    { label: t('6级-亮度100%'), value: 6 },
  ],
];

// const timeOptions = (() => {
//   const result = [[], []] as any;
//   for (let i = 0; i < 24; i++) {
//     if (i < 10) {
//       result[0].push({ label: `0${i}时`, value: `0${i}` });
//     } else {
//       result[0].push({ label: `${i}时`, value: `${i}` });
//     }
//   }
//   for (let i = 0; i < 60; i++) {
//     if (i < 10) {
//       result[1].push({ label: `0${i}分`, value: `0${i}` });
//     } else {
//       result[1].push({ label: `${i}分`, value: `${i}` });
//     }
//   }
//   return result;
// })();

// const getTimeTextBySecond = (s: number) => {
//   let h = Math.floor(s / 3600);
//   let m = 0;
//   if (s - h * 3600 > 0) {
//     m = Math.floor((s - h * 3600) / 60);
//   }
//   h = `${h}`.padStart(2, '0') as any;
//   m = `${m}`.padStart(2, '0') as any;
//   return `${h}时${m}分`;
// };

export function MoreSetting({
  deviceData,
  doControlDeviceData,
  sdk,
  templateMap,
}) {
  useTitle(t('设置'));
  const switchNum = getSwitchNum(templateMap);

  const { data: switchNameMap = {} } = useSwitchNameMap({ switchNum, sdk });

  const { data: TimerList = [], isValidating, mutate: reloadTimerList } = useSWR('AppGetTimerList', async () => {
    const { TimerList } = await sdk.requestTokenApi('AppGetTimerList', {
      ProductId: sdk.productId,
      DeviceName: sdk.deviceName,
    });
    return TimerList || [] as any[];
  });

  const {
    ledBrightnessTimerWhen630AM,
    ledBrightnessTimerWhen1830PM,
    ledBrightnessTimerWhen2130PM,
  } = useMemo(() => ({
    ledBrightnessTimerWhen630AM: TimerList.find(item => item.Data === '{"led_brightness":5}'), // 80
    ledBrightnessTimerWhen1830PM: TimerList.find(item => item.Data === '{"led_brightness":3}'), // 40
    ledBrightnessTimerWhen2130PM: TimerList.find(item => item.Data === '{"led_brightness":2}'), // 10
  }), [TimerList]);

  const {
    outage_status = 0,
    led_brightness = 1,
    // auto_light,
  } = deviceData;

  const isOpenAutoLedBrightness = useMemo<boolean>(
    () => ledBrightnessTimerWhen630AM?.Status
      && ledBrightnessTimerWhen1830PM?.Status
      && ledBrightnessTimerWhen2130PM?.Status,
    [TimerList],
  );

  const toggleAutoLedBrightness = async (checked: boolean) => {
    try {
      const loadingToast = Toast.show({
        content: t('请等待...'),
        icon: 'loading',
        maskClickable: false,
        duration: 60,
      });

      const timerConfigList = [
        { TimerPoint: '06:30', Data: '{"led_brightness":5}' },
        { TimerPoint: '18:30', Data: '{"led_brightness":3}' },
        { TimerPoint: '21:30', Data: '{"led_brightness":2}' },
      ];

      // eslint-disable-next-line
      for (const [index, timer] of [ledBrightnessTimerWhen630AM, ledBrightnessTimerWhen1830PM, ledBrightnessTimerWhen2130PM].entries()) {
        if (timer) {
          await sdk.requestTokenApi('AppModifyTimerStatus', {
            ProductId: sdk.productId,
            DeviceName: sdk.deviceName,
            TimerId: timer.TimerId,
            Status: checked ? 1 : 0,
          });
        } else {
          await sdk.requestTokenApi('AppCreateTimer', {
            ProductId: sdk.productId,
            DeviceName: sdk.deviceName,
            Data: timerConfigList[index].Data,
            Days: '1111111',
            Repeat: 1,
            TimePoint: timerConfigList[index].TimerPoint,
            TimerName: '指示灯亮度调节'
          });
        }
      }

      // 开启时调节一下亮度
      const date = new Date();
      const hour = date.getHours();
      const minute = date.getMinutes();
      let brightness = 2;
      if (hour === 6) {
        if (minute >= 30) {
          // 5
          brightness = 5;
        } else {
          // 2
          brightness = 2;
        }
      }
      if (hour === 18) {
        if (minute >= 30) {
          // 3
          brightness = 3;
        } else {
          // 5
          brightness = 5;
        }
      }
      if (hour === 21) {
        if (minute >= 30) {
          // 2
          brightness = 2;
        } else {
          // 3
          brightness = 3;
        }
      }
      if (hour > 21 && hour <= 24 && hour >= 0 && hour < 6) {
        // 2
        brightness = 2;
      }
      if (hour > 6 && hour < 18) {
        // 5
        brightness = 5;
      }
      if (hour > 18 && hour < 21) {
        // 3
        brightness = 3;
      }

      await reloadTimerList();

      if (checked) {
        doControlDeviceData({ led_brightness: brightness });
      }

      loadingToast.close();
    } catch (err) {
      Toast.show({
        content: t('切换状态失败'),
        icon: 'fail',
      });
      console.error('状态AutoLedBrightness切换失败', err);
    }
  };

  return (
    <>
      <List header={t('基础设置')}>
        <List.Item
          extra={ledBrightnessOptions[0][led_brightness - 1]?.label || '-'}
          clickable
          onClick={async () => {
            const res = await Picker.prompt({
              columns: ledBrightnessOptions,
            });
            const val = res?.[0];
            if (typeof val === 'number') {
              doControlDeviceData({ led_brightness: val });
            }
          }}
        >
          {t("指示灯亮度")}
        </List.Item>
        <List.Item
          extra={(
            <Switch
              loading={isValidating}
              checked={isOpenAutoLedBrightness}
              onChange={async (val) => {
                await toggleAutoLedBrightness(val);
              }}
            />
          )}
          description={t('根据当前时间自动调节指示灯亮度')}
        >
          {t('指示灯自动调节模式')}
        </List.Item>
        {/* <List.Item*/}
        {/*  clickable*/}
        {/*  onClick={() => sdk.goTimingProjectPage()}*/}
        {/* >*/}
        {/*  定时任务*/}
        {/* </List.Item>*/}
        <List.Item
          extra={outageStatusOptions[0][outage_status]?.label || '-'}
          clickable
          onClick={async () => {
            const res = await Picker.prompt({
              columns: outageStatusOptions,
            });
            const val = res?.[0];
            if (typeof val === 'number') {
              doControlDeviceData({ outage_status: val });
            }
          }}
        >
          {t("断电后通电状态")}
        </List.Item>
      </List>
      {/* <List header='倒计时关闭设置'>*/}
      {/*  {new Array(switchNum).fill('')*/}
      {/*    .map((_, index) => {*/}
      {/*      const modeProperty = `count_down${index + 1}`;*/}
      {/*      return (*/}
      {/*        <List.Item*/}
      {/*          extra={`${getTimeTextBySecond(deviceData[modeProperty] || 0)} 后关闭`}*/}
      {/*          key={index}*/}
      {/*          onClick={async () => {*/}
      {/*            const res = await Picker.prompt({*/}
      {/*              columns: timeOptions,*/}
      {/*            });*/}
      {/*            if (res) {*/}
      {/*              let [h, m] = res;*/}
      {/*              h = Number(h);*/}
      {/*              m = Number(m);*/}
      {/*              doControlDeviceData({ [modeProperty]: h * 3600 + m * 60 });*/}
      {/*            }*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          {switchNameMap[`switch_${index + 1}`]}*/}
      {/*        </List.Item>*/}
      {/*      );*/}
      {/*    })}*/}
      {/* </List>*/}
      <List header={t('转无线开关设置')}>
        {new Array(switchNum).fill('')
          .map((_, index) => {
            const modeProperty = `mode_switch${index + 1}`;
            const isSceneMode = deviceData[modeProperty] === 1;
            return (
              <List.Item
                extra={modeSwitchOptions[0][deviceData[modeProperty]]?.label || '-'}
                key={index}
                description={isSceneMode && t('实体按键不再控制回路通断，仅触发场景')}
                onClick={async () => {
                  const res = await Picker.prompt({
                    columns: modeSwitchOptions,
                  });
                  const val = res?.[0];
                  if (typeof val === 'number') {
                    doControlDeviceData({ [modeProperty]: val });
                  }
                }}
              >
                {switchNameMap[`switch_${index + 1}`]}
              </List.Item>
            );
          })}
      </List>
    </>
  );
}

