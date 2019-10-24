import React from 'react';
import { Snackbar, SnackbarContent } from '@material-ui/core';

export const Snickers = ({ open, message, duration, backgroundColor, color, onClose }) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={duration}
      open={open}
      onClose={onClose}>
      <SnackbarContent
        style={{
          backgroundColor: backgroundColor,
          color: color
        }}
        message={message}
      />
    </Snackbar>
  );
};
