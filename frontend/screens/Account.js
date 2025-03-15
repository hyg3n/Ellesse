import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext"; // Import Auth Context

const Account = () => {
  const { logout } = useContext(AuthContext); // Get logout function

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 }
});

export default Account;
