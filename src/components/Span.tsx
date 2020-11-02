import styled from 'styled-components';

type SpanProps = {size?: number | string};
const Span = styled.span<SpanProps>`
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
