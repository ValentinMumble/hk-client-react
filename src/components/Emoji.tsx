import React, {HTMLAttributes, ReactNode} from 'react';
import styled from 'styled-components';

const EmojiContainer = styled.span`
  cursor: ${({onClick}) => (onClick ? 'pointer' : 'inherit')};
  user-select: none;
  display: inline-flex;
  justify-content: center;
  width: 1.2em;

  :first-child {
    margin-right: 5px;
  }
`;

type EmojiProps = {
  e: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

const Emoji = ({e, children, ...props}: EmojiProps) => (
  <EmojiContainer {...props}>
    {e}
    {children}
  </EmojiContainer>
);

export {Emoji};
