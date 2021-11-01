<template>
  <v-app>




    <v-main class="grey lighten-4">
      <v-card max-width="800px" class="mx-auto my-5">
        <v-toolbar dark color="primary">
          <v-toolbar-title>File POSTer</v-toolbar-title>
        </v-toolbar>
        <v-form
          @submit.prevent="post_file()">
        <v-card-text>

          <div class="text-h6">
            Target URL
          </div>


            <v-text-field
              class="mt-3"
              label="URL"
              v-model="url"
              :rules="url_rules"/>


            <div class="text-h6">
              File
            </div>

            <v-row>
              <v-col>
                <v-file-input
                  label="file"
                  v-model="file"/>
              </v-col>
              <v-col>
                <v-text-field
                  label="Field name"
                  :rules="field_name_rules"
                  v-model="field_name"/>
              </v-col>
            </v-row>







            <v-row>
              <v-col class="text-h6">
                Form-data fields
              </v-col>
              <v-col cols="auto">
                <v-btn @click="add_field()">
                  <v-icon>mdi-plus</v-icon>
                  <span>Add field</span>
                </v-btn>
              </v-col>
            </v-row>

            <template v-if="fields.length">
              <v-row
                v-for="(field, field_index) in fields"
                :key="`field_${field_index}`">
                <v-col>
                  <v-text-field
                    label="Field name"
                    v-model="field.name"/>
                </v-col>
                <v-col>
                  <v-text-field
                  label="Field value"
                  v-model="field.value"/>
                </v-col>
                <v-col cols="auto">
                  <v-btn icon @click="delete_field(field_index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </template>

            <v-row v-else>
              <v-col>
                No fields
              </v-col>
            </v-row>




        </v-card-text>

        <v-card-text class="text-center">
          <v-btn
            type="submit"
            :loading="posting"
            :disabled="!url_valid || !file">
            <v-icon>mdi-upload</v-icon>
            <span>POST</span>
          </v-btn>
        </v-card-text>
        </v-form>
      </v-card>




    </v-main>

    <v-snackbar
      :color="snackbar.color"
      v-model="snackbar.open">
      {{ snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn
          dark
          text
          v-bind="attrs"
          @click="snackbar.open = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

  </v-app>
</template>

<script>

export default {
  name: 'App',
  data(){
    return {
      fields: [],
      file: null,
      url: 'http://192.168.1.2:7070/file',
      field_name: 'image',
      posting: false,
      url_rules: [
        v => !!v || 'URL is required',
        () => this.url_valid || 'URL is invalid',
      ],
      field_name_rules: [ v => !!v || 'Field name is required' ],
      snackbar: {
        open: false,
        text: null,
        color: 'green'
      }
    }
  },
  methods: {
    post_file(){
      this.posting = true

      const headers = {'Content-Type': 'multipart/form-data' }
      const formData = new FormData()
      formData.append(this.field_name, this.file)

      this.fields.forEach((item) => {
        formData.append(item.name, item.value)
      })


      this.axios.post(this.url, formData, { headers })
        .then( () => {
          this.snackbar.open = true
          this.snackbar.color = 'green'
          this.snackbar.text = 'POST successful'
        })
        .catch( (error) => {

          if(error.response) console.error(error.response.data)
          else console.error(error)

          this.snackbar.open = true
          this.snackbar.color = 'red'
          this.snackbar.text = 'POST failed, see console for details'
        })
        .finally( () => {
          this.posting = false
        })


    },
    add_field(){
      this.fields.push({name: '', value: ''})
    },
    delete_field(i){
      this.fields.splice(i,1)
    }
  },
  computed: {
    url_valid(){
      try {
        new URL(this.url)
        return true
      }
      catch {
        return false
       }
    }
  }

}
</script>

<style>

</style>
