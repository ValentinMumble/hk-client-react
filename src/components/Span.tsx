import styled from 'styled-components';

const Span = styled.span<{size?: number | string}>`
  display: flex;
  font-size: ${props => {
    if (Number(props.size)) return props.size + 'vh';
    switch (props.size) {
      case 'large':
        return '10vh';
      default:
        return 'inherit';
    }
  }};
`;

export {Span};
