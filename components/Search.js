import React from 'react';
import { Searchbar } from 'react-native-paper';

export function Search() {
    return (
      <Searchbar
      style={{marginTop: 60}}
        placeholder="Search"
      />
    );
}