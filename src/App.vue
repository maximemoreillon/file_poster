<template>
  <v-app>




    <v-main class="grey lighten-4">
      <v-card max-width="800px" class="mx-auto my-5">
        <v-toolbar dark color="#444444">
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
                  <v-spacer></v-spacer>
                  <v-col cols="auto">
                    <RequestHistoryDialog :history="request_history" @loadRequest="request = $event" />
                  </v-col>

                </v-row>
              </v-toolbar>

              <v-card-text>
                <v-row>
                  <v-col>
                    <v-text-field v-model="request.url" :rules="url_rules" />
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
                    <v-text-field label="Field name" :rules="field_name_rules" v-model="request.file_field_name" />
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
                <template v-if="request.fields.length">
                  <v-row align="center" v-for="(field, field_index) in request.fields" :key="`field_${field_index}`">
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
                <template v-if="request.headers.length">
                  <v-row align="center" v-for="(header, index) in request.headers" :key="`header_${index}`">
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
                <v-btn large type="submit" :loading="posting" :disabled="!url_valid || !file">
                  <v-icon>mdi-upload</v-icon>
                  <span>POST</span>
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn large :disabled="!posting" @click="cancel_upload()">
                  <v-icon>mdi-close</v-icon>
                  <span>cancel</span>
                </v-btn>
              </v-col>
              <v-spacer />
            </v-row>

          </v-card-text>

        </v-form>

        <v-card-text v-if="response">
          <Response :response="response" :processing="posting" />
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

    <v-footer>
      <v-col class="text-center" cols="12"> File POSTer - Maxime MOREILLON </v-col>
    </v-footer>

  </v-app>
</template>

<script>
import About from '@/components/About.vue'
import Response from '@/components/Response.vue'
import RequestHistoryDialog from '@/components/RequestHistoryDialog.vue'


export default {
  name: 'App',
  components: {
    About,
    Response,
    RequestHistoryDialog

  },
  data(){
    return {
      request: {
        
        url: 'http://192.168.1.2:7070/file',
        file_field_name: 'image',

        fields: [],
        headers: [],
      },

      file: null,
      

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
      
      request_history: [],




      response: null,

    }
  },
  mounted() {
    this.load_history()
  },

  methods: {
    post_file(){
      this.posting = true
      this.error = null
      this.abortController = new AbortController()

      this.add_request_to_history()


      const formData = new FormData()
      formData.append(this.request.file_field_name, this.file)

      this.request.fields.forEach((item) => { formData.append(item.name, item.value) })

      const headers = this.request.headers.reduce( (acc, header) => ({...acc, [header.name] : header.value}), {'Content-Type': 'multipart/form-data' })


      const options = { headers, signal: this.abortController.signal }

      this.axios.post(this.request.url, formData, options)
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
    add_request_to_history() {
      const last_item = this.request_history[this.request_history.length - 1]
      if (JSON.stringify(this.request) === JSON.stringify(last_item)) return
      this.request_history.push({ ...this.request })
      if (this.request_history.length > 10) this.request_history.shift()
      this.save_history()
    },
    save_history() {
      const history_stringified = JSON.stringify(this.request_history)
      localStorage.file_poster_history = history_stringified
    },
    load_history() {
      const history_stringified = localStorage.file_poster_history
      if (!history_stringified) return
      try {
        this.request_history = JSON.parse(history_stringified)
        const last_item = this.request_history[this.request_history.length - 1]
        if (last_item)
          this.request = { ...last_item }
      } catch (error) {
        console.warn(error)
      }
    },

    cancel_upload(){
      this.abortController.abort()
    },
    add_field(){
      this.request.fields.push({name: '', value: ''})
    },
    delete_field(i){
      this.request.fields.splice(i,1)
    },
    add_header(){
      this.request.headers.push({name: '', value: ''})
    },
    delete_header(i){
      this.request.headers.splice(i,1)
    }
  },
  computed: {
    url_valid(){
      try {
        new URL(this.request.url)
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
