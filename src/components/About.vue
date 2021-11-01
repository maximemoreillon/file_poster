<template>
  <v-dialog
        v-model="dialog"
        width="500"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            text
            dark
            v-bind="attrs"
            v-on="on">
            <v-icon>mdi-information-outline</v-icon>
            <span class="ml-2">About</span>
          </v-btn>
        </template>

        <v-card>
          <v-card-title>
            File POSTer
          </v-card-title>

          <v-card-text>
            version: {{version}}
          </v-card-text>

          <v-card-text>
            developed and mantainted by Maxime MOREILLON
          </v-card-text>


          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="dialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script>
import {version} from '../../package.json'
export default {
  name: 'About',
  data: () => ({
    dialog: false,
    version,
  }),
}
</script>
