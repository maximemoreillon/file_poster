<template>
  <v-app>
    <v-main class="grey lighten-4">
      <v-card max-width="800px" class="mx-auto my-5">
        <v-toolbar dark color="#444444">
          <v-img
            src="@/assets/moreillon_logo.png"
            max-height="2.5em"
            max-width="2.5em"
            class="mr-2 rotating_logo"
          ></v-img>
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
                    <RequestHistoryDialog
                      :history="request_history"
                      @loadRequest="request = $event"
                    />
                  </v-col>
                </v-row>
              </v-toolbar>

              <v-card-text>
                <v-text-field v-model="request.url" :rules="url_rules" />
              </v-card-text>
            </v-card>
          </v-card-text>

          <v-card-text>
            <v-card outlined>
              <v-toolbar flat dense>
                <v-tabs v-model="tab">
                  <v-tabs-slider />
                  <v-tab v-for="t in tabs" :key="t">{{ t }}</v-tab>
                </v-tabs>
              </v-toolbar>
              <v-divider />
              <v-card-text>
                <v-tabs-items v-model="tab">
                  <v-tab-item>
                    <RequestFiles v-model="request.files" />
                  </v-tab-item>
                  <v-tab-item>
                    <RequestFields v-model="request.fields" />
                  </v-tab-item>
                  <v-tab-item>
                    <RequestHeaders v-model="request.headers" />
                  </v-tab-item>
                </v-tabs-items>
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
                  :disabled="!url_valid || !file"
                >
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

        <v-card-text v-if="posting">
          <v-progress-linear height="25" :value="this.uploadProgress" rounded>
            {{ this.uploadProgress }}%
          </v-progress-linear>
        </v-card-text>

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
      <v-col class="text-center" cols="12">
        File POSTer - Maxime MOREILLON
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import About from "@/components/About.vue";
import Response from "@/components/Response.vue";
import RequestHistoryDialog from "@/components/RequestHistoryDialog.vue";
import RequestFiles from "./components/RequestFiles.vue";
import RequestHeaders from "./components/RequestHeaders.vue";
import RequestFields from "./components/RequestFields.vue";

export default {
  name: "App",
  components: {
    About,
    Response,
    RequestHistoryDialog,
    RequestFiles,
    RequestHeaders,
    RequestFields,
  },
  data() {
    return {
      request: {
        url: "http://192.168.1.2:7070/file",

        files: [{ file: "", field_name: "" }],
        fields: [],
        headers: [],
      },

      file: null,

      posting: false,
      uploadProgress: 0,
      abortController: null,

      url_rules: [
        (v) => !!v || "URL is required",
        () => this.url_valid || "URL is invalid",
      ],
      snackbar: {
        open: false,
        text: null,
        color: "green",
      },

      request_history: [],

      response: null,

      tab: null,
      tabs: ["File", "Fields", "Headers"],
    };
  },
  mounted() {
    this.load_history();
  },

  methods: {
    post_file() {
      this.posting = true;
      this.uploadProgress = 0;

      this.error = null;
      this.abortController = new AbortController();

      this.add_request_to_history();

      const formData = new FormData();
      formData.append(this.request.file_field_name, this.file);

      this.request.fields.forEach((item) => {
        formData.append(item.name, item.value);
      });

      const headers = this.request.headers.reduce(
        (acc, header) => ({ ...acc, [header.name]: header.value }),
        { "Content-Type": "multipart/form-data" }
      );

      const options = {
        headers,
        signal: this.abortController.signal,
        onUploadProgress: (progressEvent) => {
          this.uploadProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        },
      };

      this.axios
        .post(this.request.url, formData, options)
        .then((response) => {
          this.snackbar.open = true;
          this.snackbar.color = "green";
          this.snackbar.text = "POST successful";

          this.response = response;
        })
        .catch((error) => {
          if (error.response) {
            this.response = error.response;
          } else {
            console.error(error);
          }

          this.snackbar.open = true;
          this.snackbar.color = "red";
          this.snackbar.text = "POST failed, see console for details";
        })
        .finally(() => {
          this.posting = false;
        });
    },
    add_request_to_history() {
      const last_item = this.request_history[this.request_history.length - 1];
      if (JSON.stringify(this.request) === JSON.stringify(last_item)) return;
      this.request_history.push({ ...this.request });
      if (this.request_history.length > 10) this.request_history.shift();
      this.save_history();
    },
    save_history() {
      const history_stringified = JSON.stringify(this.request_history);
      localStorage.file_poster_history = history_stringified;
    },
    load_history() {
      const history_stringified = localStorage.file_poster_history;
      if (!history_stringified) return;
      try {
        this.request_history = JSON.parse(history_stringified);
        const last_item = this.request_history[this.request_history.length - 1];
        if (last_item) this.request = { ...last_item };
      } catch (error) {
        console.warn(error);
      }
    },

    cancel_upload() {
      this.abortController.abort();
    },

    add_header() {
      this.request.headers.push({ name: "", value: "" });
    },
    delete_header(i) {
      this.request.headers.splice(i, 1);
    },
  },
  computed: {
    url_valid() {
      try {
        new URL(this.request.url);
        return true;
      } catch {
        return false;
      }
    },
    response_pretty() {
      let output;
      try {
        output = JSON.stringify(JSON.parse(this.response.body), null, 2);
      } catch (error) {
        output = this.response.body;
      }
      return output;
    },
  },
};
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

.rotating_logo {
  animation-name: rotating_logo;
  animation-duration: 60s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes rotating_logo {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
