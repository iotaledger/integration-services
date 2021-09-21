import styled from "styled-components";

export const CheckoutItemContainer = styled.div`
background-color: ${props => props.theme.green};
padding: 15px;
margin: 10px;
display: flex;
align-items: center;
border-radius: 3px;
box-shadow: 5px 5px 16px 0px rgba(0,0,0,0.4);
`

export const CheckoutItemImage = styled.img`
width: 50px;
height: auto;
`

export const CheckoutItemName = styled.span`
font-size: larger;
margin: 0 20px;
`