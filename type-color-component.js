import { BasePropertyComponent } from 'adminjs';

export default (props) => {
  const value = props.record.params[props.property.name];

  let color;
  switch (value) {
    case 'Caution':
      color = '#FFD700'; // Vàng
      break;
    case 'Warning':
      color = '#FFA500'; // Cam
      break;
    case 'Danger':
      color = '#FF0000'; // Đỏ
      break;
    case 'pending':
      color = '#0000FF'; // Xanh dương
      break;
    case 'accepted':
      color = '#008000'; // Xanh lá
      break;
    case 'rejected':
      color = '#FF0000'; // Đỏ
      break;
    default:
      color = '#000000'; // Mặc định: Đen
  }

  // Trả về HTML với màu sắc
  return `<span style="color: ${color}; font-weight: bold;">${value}</span>`;
};
