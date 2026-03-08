import { Colors } from '@/constants/theme';
import { Text, TouchableHighlight, useColorScheme } from "react-native";

export default function CheckoutButton(
  props: React.ComponentProps<typeof TouchableHighlight> & { title: string }
) {
   const colorScheme = useColorScheme();
  return (
    <TouchableHighlight
      underlayColor={Colors[colorScheme ?? 'light'].success}
      {...props}
      style={[
        {
          backgroundColor: Colors[colorScheme ?? 'light'].success,
          justifyContent: "center",
          padding: 12,
          borderRadius: 8,
        },
        props.style,
      ]}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "600",
          fontSize: 20,
          textAlign: "center",
        }}
      >
        {props.title}
      </Text>
    </TouchableHighlight>
  );
}