import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import type { AvatarProps, TagType } from 'antd';
import { Avatar, Breadcrumb, ConfigProvider, Space } from 'antd';
import type { DirectionType } from 'antd/lib/config-provider';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import * as React from 'react';
import useStyle from './style/index';
import type { ContentWidth } from '../../defaultSettings';
import 'antd/lib/breadcrumb/style';
import type { LegacyBreadcrumbProps, NewBreadcrumbProps } from 'antd/lib/breadcrumb/Breadcrumb';

export interface PageHeaderProps {
  backIcon?: React.ReactNode;
  prefixCls?: string;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  style?: React.CSSProperties;
  childrenContentStyle?: React.CSSProperties;
  breadcrumb?: Partial<NewBreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
  breadcrumbRender?: (props: PageHeaderProps, defaultDom: React.ReactNode) => React.ReactNode;
  tags?: React.ReactElement<TagType> | React.ReactElement<TagType>[];
  footer?: React.ReactNode;
  extra?: React.ReactNode;
  avatar?: AvatarProps;
  onBack?: (e?: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  contentWidth?: ContentWidth;
  ghost?: boolean;
  children?: React.ReactNode;
}

const renderBack = (
  prefixCls: string,
  hashId: string,
  backIcon?: React.ReactNode,
  onBack?: (e?: React.MouseEvent<HTMLElement>) => void,
) => {
  if (!backIcon || !onBack) {
    return null;
  }
  return (
    <div className={`${prefixCls}-back ${hashId}`}>
      <div
        role="button"
        onClick={(e) => {
          onBack?.(e);
        }}
        className={`${prefixCls}-back-button ${hashId}`}
        aria-label="back"
      >
        {backIcon}
      </div>
    </div>
  );
};

const renderBreadcrumb = (breadcrumb: NewBreadcrumbProps, prefixCls: string) => {
  if (!breadcrumb.items?.length) return null;
  return (
    <Breadcrumb
      {...breadcrumb}
      className={classNames(`${prefixCls}-breadcrumb`, breadcrumb.className)}
    />
  );
};

const getBackIcon = (props: PageHeaderProps, direction: DirectionType = 'ltr') => {
  if (props.backIcon !== undefined) {
    return props.backIcon;
  }
  return direction === 'rtl' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />;
};

const renderTitle = (
  prefixCls: string,
  props: PageHeaderProps,
  direction: DirectionType = 'ltr',
  hashId: string,
) => {
  const { title, avatar, subTitle, tags, extra, onBack } = props;
  const headingPrefixCls = `${prefixCls}-heading`;
  const hasHeading = title || subTitle || tags || extra;
  // If there is nothing, return a null
  if (!hasHeading) {
    return null;
  }
  const backIcon = getBackIcon(props, direction);
  const backIconDom = renderBack(prefixCls, hashId, backIcon, onBack);
  const hasTitle = backIconDom || avatar || hasHeading;
  return (
    <div className={headingPrefixCls + ' ' + hashId}>
      {hasTitle && (
        <div className={`${headingPrefixCls}-left ${hashId}`}>
          {backIconDom}
          {avatar && (
            <Avatar
              className={classNames(`${headingPrefixCls}-avatar`, hashId, avatar.className)}
              {...avatar}
            />
          )}
          {title && (
            <span
              className={`${headingPrefixCls}-title ${hashId}`}
              title={typeof title === 'string' ? title : undefined}
            >
              {title}
            </span>
          )}
          {subTitle && (
            <span
              className={`${headingPrefixCls}-sub-title ${hashId}`}
              title={typeof subTitle === 'string' ? subTitle : undefined}
            >
              {subTitle}
            </span>
          )}
          {tags && <span className={`${headingPrefixCls}-tags ${hashId}`}>{tags}</span>}
        </div>
      )}
      {extra && (
        <span className={`${headingPrefixCls}-extra ${hashId}`}>
          <Space>{extra}</Space>
        </span>
      )}
    </div>
  );
};

const renderFooter = (prefixCls: string, footer: React.ReactNode, hashId: string) => {
  if (footer) {
    return <div className={`${prefixCls}-footer ${hashId}`}>{footer}</div>;
  }
  return null;
};

const renderChildren = (prefixCls: string, children: React.ReactNode, hashId: string) => (
  <div className={`${prefixCls}-content ${hashId}`}>{children}</div>
);

const PageHeader: React.FC<PageHeaderProps> = (props) => {
  const [compact, updateCompact] = React.useState<boolean>(false);
  const onResize = ({ width }: { width: number }) => {
    updateCompact(width < 768);
  };

  const { getPrefixCls, direction } = React.useContext(ConfigProvider.ConfigContext);

  const {
    prefixCls: customizePrefixCls,
    style,
    footer,
    children,
    breadcrumb,
    breadcrumbRender,
    className: customizeClassName,
    contentWidth,
  } = props;

  const prefixCls = getPrefixCls('page-header', customizePrefixCls);
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const getDefaultBreadcrumbDom = () => {
    if (
      breadcrumb &&
      !(breadcrumb as NewBreadcrumbProps)?.items &&
      (breadcrumb as unknown as LegacyBreadcrumbProps)?.routes
    ) {
      // @ts-ignore
      breadcrumb.items = breadcrumb.routes;
    }

    if ((breadcrumb as NewBreadcrumbProps)?.items) {
      return renderBreadcrumb(breadcrumb as NewBreadcrumbProps, prefixCls);
    }
    return null;
  };

  const defaultBreadcrumbDom = getDefaultBreadcrumbDom();

  const isBreadcrumbComponent = breadcrumb && 'props' in breadcrumb;

  // support breadcrumbRender function
  const breadcrumbRenderDomFromProps =
    breadcrumbRender?.({ ...props, prefixCls }, defaultBreadcrumbDom) ?? defaultBreadcrumbDom;

  const breadcrumbDom = isBreadcrumbComponent ? breadcrumb : breadcrumbRenderDomFromProps;

  const className = classNames(prefixCls, hashId, customizeClassName, {
    [`${prefixCls}-has-breadcrumb`]: !!breadcrumbDom,
    [`${prefixCls}-has-footer`]: !!footer,
    [`${prefixCls}-rtl`]: direction === 'rtl',
    [`${prefixCls}-compact`]: compact,
    [`${prefixCls}-wide`]: contentWidth === 'Fixed',
    [`${prefixCls}-ghost`]: true,
  });
  const title = renderTitle(prefixCls, props, direction, hashId);
  const childDom = children && renderChildren(prefixCls, children, hashId);
  const footerDom = renderFooter(prefixCls, footer, hashId);

  if (!breadcrumbDom && !title && !footerDom && !childDom) {
    return null;
  }

  return wrapSSR(
    <ResizeObserver onResize={onResize}>
      <div className={className} style={style}>
        {breadcrumbDom}
        {title}
        {childDom}
        {footerDom}
      </div>
    </ResizeObserver>,
  );
};

export { PageHeader };
