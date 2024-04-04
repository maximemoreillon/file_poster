<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn text dark v-bind="attrs" v-on="on">
        <v-icon left>mdi-information-outline</v-icon>
        <span>About</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title> File POSTer </v-card-title>

      <v-card-text> version: {{ version }} </v-card-text>

      <v-card-text>
        Developed and mantainted by Maxime MOREILLON and Osuke SHITO
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { version } from "../../package.json"
export default {
  name: "About",
  data: () => ({
    dialog: false,
    version,
  }),
}
</script>
