import Icons from 'static/icons/icons.svg';
import { ForwardedRef, forwardRef, isValidElement, ReactNode } from 'react';

export interface IconProps {
  size: number;
  name?: string;
  file?: string;
  color?: string;
}

export type IconType = IconProps | ReactNode;

export const userIcon = (icon: IconType) =>
  icon && (isValidElement(icon) ? icon : <Icon {...(icon as IconProps)} />);

export const Icon = forwardRef(
  (
    {
      name,
      file,
      size,
      color = 'var(--color-blue-grey-300)',
      ...props
    }: IconProps,
    ref: ForwardedRef<any>
  ) => file
? (<img
    width={size}
    height={size}
    src={file}
    ref={ref}
    {...props}
/>)
: (
  <svg
    className={`icon icon-${name}`}
    fill={color}
    width={size}
    height={size}
    data-testid={`icon-${name}`}
    ref={ref}
    {...props}
  >
    <use href={`${Icons}#icon-${name}`} xlinkHref={`${Icons}#icon-${name}`} />
  </svg>
  )
);
