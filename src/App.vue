<template>
  <v-app>




    <v-main class="grey lighten-4">
      <v-card max-width="800px" class="mx-auto my-5">
        <v-toolbar dark color="primary">
          <v-toolbar-title>File POSTer</v-toolbar-title>
          <v-spacer />
          <About />
        </v-toolbar>
        <v-form @submit.prevent="post_file()">


          <v-card-text>
            <v-card outlined>
              <v-toolbar flat>
                <v-row>
                  <v-col>
                    <v-toolbar-title>URL</v-toolbar-title>
                  </v-col>
                </v-row>
              </v-toolbar>

              <v-card-text>
                <v-row>
                  <v-col>
                    <v-text-field v-model="url" :rules="url_rules" />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>

          <v-card-text>
            <v-card outlined>
              <v-toolbar flat>
                <v-row>
                  <v-col>
                    <v-toolbar-title>File</v-toolbar-title>
                  </v-col>
                </v-row>
              </v-toolbar>

              <v-card-text>
                <v-row>
                  <v-col>
                    <v-file-input label="file" v-model="file" />
                  </v-col>
                  <v-col>
                    <v-text-field label="Field name" :rules="field_name_rules" v-model="field_name" />
                  </v-col>
                </v-row>

              </v-card-text>
            </v-card>
          </v-card-text>

          <v-card-text>
            <v-card outlined>

              <v-toolbar flat>
                <v-row>
                  <v-col>
                    <v-toolbar-title>Fields</v-toolbar-title>
                  </v-col>
                  <v-spacer />

                  <v-col cols="auto">
                    <v-btn @click="add_field()">
                      <v-icon>mdi-plus</v-icon>
                      <span>Add field</span>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-toolbar>

              <v-card-text>
                <template v-if="fields.length">
                  <v-row align="center" v-for="(field, field_index) in fields" :key="`field_${field_index}`">
                    <v-col>
                      <v-text-field label="Field name" v-model="field.name" />
                    </v-col>
                    <v-col>
                      <v-text-field label="Field value" v-model="field.value" />
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
            </v-card>
          </v-card-text>


          <v-card-text>

            <v-card outlined>
              <v-toolbar flat>
                <v-row>
                  <v-col>
                    <v-toolbar-title>Headers</v-toolbar-title>
                  </v-col>
                  <v-spacer />

                  <v-col cols="auto">
                    <v-btn @click="add_header()">
                      <v-icon>mdi-plus</v-icon>
                      <span>Add header</span>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-toolbar>

              <v-card-text>
                <template v-if="headers.length">
                  <v-row align="center" v-for="(header, index) in headers" :key="`header_${index}`">
                    <v-col>
                      <v-text-field label="Name" v-model="header.name" />
                    </v-col>
                    <v-col>
                      <v-text-field label="Value" v-model="header.value" />
                    </v-col>
                    <v-col cols="auto">
                      <v-btn icon @click="delete_header(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </template>

                <v-row v-else>
                  <v-col>
                    No Headers
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>

          <v-card-text class="text-center">
            <v-row>
              <v-spacer />
              <v-col cols="auto">
                <v-btn 
                  large 
                  type="submit" 
                  :loading="posting" 
                  :disabled="!url_valid || !file">
                  <v-icon>mdi-upload</v-icon>
                  <span>POST</span>
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn 
                  large 
                  :disabled="!posting"
                  @click="cancel_upload()">
                  <v-icon>mdi-close</v-icon>
                  <span>cancel</span>
                </v-btn>
              </v-col>
              <v-spacer />
            </v-row>

          </v-card-text>

        </v-form>

        <v-card-text v-if="response">
          <v-card outlined>
            <v-toolbar flat>
              <v-row>
                <v-col>
                  <v-toolbar-title>Response</v-toolbar-title>
                </v-col>
              </v-row>
            </v-toolbar>

            <v-card-text>
              <template v-if="response.status">
                <h3>Status</h3>
                <p :class="{error_message: response.status.toString().charAt(0) !== '2', success_message: true}">
                  {{response.status}} {{response.statusText}}
                </p>
                <h3>Content-type</h3>
                <p>
                  {{response.headers['content-type']}}
                </p>
              </template>

              <template v-if="response.data">
                <h3>Data</h3>


                <p class="response_body" v-if="response.headers['content-type'].includes('text/html')"
                  v-html="response.data" />
                <p class="response_body" v-else-if="response.headers['content-type'].includes('application/json')">
                <pre>{{response_pretty}}</pre>
                </p>

                <p class="response_body" v-else>
                  {{response.body}}
                </p>

              </template>

              <template v-if="response.error">
                <h3>Error</h3>
                <p class="error_message">
                  {{response.error}}
                </p>
              </template>
            </v-card-text>
          </v-card>
        </v-card-text>

      </v-card>

    </v-main>

    <v-snackbar :color="snackbar.color" v-model="snackbar.open">
      {{ snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn dark text v-bind="attrs" @click="snackbar.open = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

  </v-app>
</template>

<script>
import About from '@/components/About.vue'

export default {
  name: 'App',
  components: {
    About,
  },
  data(){
    return {
      fields: [],
      file: null,
      url: 'http://192.168.1.2:7070/file',
      field_name: 'image',

      posting: false,
      abortController: null,

      url_rules: [
        v => !!v || 'URL is required',
        () => this.url_valid || 'URL is invalid',
      ],
      field_name_rules: [ v => !!v || 'Field name is required' ],
      snackbar: {
        open: false,
        text: null,
        color: 'green'
      },
      headers: [],


      response: null,

    }
  },
  methods: {
    post_file(){
      this.posting = true
      this.error = null
      this.abortController = new AbortController()

      const formData = new FormData()
      formData.append(this.field_name, this.file)

      this.fields.forEach((item) => {
        formData.append(item.name, item.value)
      })

      const headers = this.headers.reduce( (acc, header) => {
         acc[header.name] = header.value
         return acc
      }, {'Content-Type': 'multipart/form-data' })

      const options = {
        headers,
        signal: this.abortController.signal,
      }


      this.axios.post(this.url, formData, options)
        .then( (response) => {

          this.snackbar.open = true
          this.snackbar.color = 'green'
          this.snackbar.text = 'POST successful'

          this.response = response

        })
        .catch( (error) => {

          if(error.response) {
            this.response = error.response
          }
          else {
            console.error(error)
          }

          this.snackbar.open = true
          this.snackbar.color = 'red'
          this.snackbar.text = 'POST failed, see console for details'


        })
        .finally( () => {
          this.posting = false
        })


    },
    cancel_upload(){
      this.abortController.abort()
    },
    add_field(){
      this.fields.push({name: '', value: ''})
    },
    delete_field(i){
      this.fields.splice(i,1)
    },
    add_header(){
      this.headers.push({name: '', value: ''})
    },
    delete_header(i){
      this.headers.splice(i,1)
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
    },
    response_pretty() {
      let output
      try {
        output = JSON.stringify(JSON.parse(this.response.body), null, 2)
      }
      catch (error) {
        output = this.response.body
      }
      return output
    },
  }

}
</script>

<style>
.response_body {
  width: 100%;
  overflow-x: auto;
}
.success_message {
  color: #00c000;
}
.error_message {
  color: #c00000;
}
</style>
