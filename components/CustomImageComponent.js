import React from 'react';

const CustomImageComponent = (props) => {
  const { record } = props;
  const imgSrc = record.params.img
    ? `http://localhost:3000/api/img${record.params.img}`
    : null;

  console.log('Image Source:', imgSrc); // Kiểm tra đường dẫn

  return imgSrc ? (
    React.createElement('img', { src: imgSrc, alt: 'Pothole', width: '200' })
  ) : (
    React.createElement('span', null, 'No image available')
  );
};

export default CustomImageComponent;