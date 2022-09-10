import styled, { css, StyledComponent } from 'styled-components';

export const Page: any = styled.div`
  display: flex;
  min-height: 100vh;
  z-index: 0;
  position: ${ (props:any) => props.relative ? "relative" : 'inherit'};
  
`;
 

export const preventSelectStyles = css`
user-select: none;
-moz-user-select: none;
-webkit-user-drag: none;
-webkit-user-select: none;
-ms-user-select: none;
`
 