import React from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { SvgIcon } from '@components/common/icon';
import { CurrentSkinProps } from '../skinProps';
import { getThemeType } from '@libs/theme';
import { onControlDevice } from '@hooks/useDeviceData';
import './top-nav.less';

interface TopNavProps {
  status: number;
}

export function TopNav(props: TopNavProps) {
  const themeType = getThemeType();
  const history = useHistory();
  const navStatus = props.status === 1 ? 'active' : 'default';

  const moreColor = (status: string) => {
    const colorObj = CurrentSkinProps.more;
    return colorObj[status];
  };

  const handleClickMore = function () {
    history.push('/details');
  };
  return (
    <header className="top-nav">
      <div
        className={classNames('top-left', navStatus === 'active' ? 'open' : '')}
        onClick={() => {
          onControlDevice('child_lock', navStatus === 'active' ? 0 : 1);
        }}
      >
        <span className="icon-lock"></span>
        {themeType === 'blueWhite' || themeType === 'dark' ? (
          <label className="lock-status">
            {navStatus === 'active' ? '童锁开' : '童锁关'}
          </label>
        ) : null}
      </div>
      { (themeType === 'normal' || themeType === 'colorful' || themeType === 'morandi') ?
        <span className="top-middle">{navStatus === 'active' ? '童锁开' : '童锁关'}</span> : null
      }
      <div className="top-right" onClick={() => handleClickMore()}>
        {themeType === 'normal' ||
        themeType === 'blueWhite' ||
        themeType === 'dark' ? (
          <SvgIcon
            className="more-cicle"
            name="icon-more-cicle"
            color={moreColor(navStatus)}
          />
        ) : (
          <SvgIcon
            className="more-line"
            name="icon-more-line"
            color={moreColor(navStatus)}
          />
        )}
      </div>
    </header>
  );
}
