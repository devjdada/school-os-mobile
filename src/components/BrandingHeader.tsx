import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  schoolName?: string;
  campusName?: string;
}

export const BrandingHeader: React.FC<Props> = ({
  schoolName = 'Atlantic Hall College',
  campusName = 'Main Campus, Lekki',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>AH</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.schoolName}>{schoolName}</Text>
        <Text style={styles.campusName}>{campusName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  schoolName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  campusName: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
