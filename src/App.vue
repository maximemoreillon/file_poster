<template>
  <v-app>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent="post_file()"
    >
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
          <v-card-text>
            <v-card outlined>
              <v-toolbar flat>
                <v-toolbar-title>URL</v-toolbar-title>
                <v-spacer></v-spacer>
                <RequestHistoryDialog
                  v-if="url_editable"
                  cols="auto"
                  :history="request_history"
                  @loadRequest="request = $event"
                />
              </v-toolbar>

              <v-card-text>
                <v-text-field
                  v-model="request.url"
                  :rules="url_rules"
                  :disabled="!url_editable"
                />
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
                  <v-tab-item eager>
                    <RequestFiles
                      v-model="request.files"
                      :editable="files_editable"
                    />
                  </v-tab-item>
                  <v-tab-item v-if="tabs.includes('FIELDS')" eager>
                    <RequestFields
                      v-model="request.fields"
                      :editable="fields_editable"
                    />
                  </v-tab-item>
                  <v-tab-item v-if="tabs.includes('HEADERS')" eager>
                    <RequestHeaders
                      v-model="request.headers"
                      :editable="headers_editable"
                    />
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
                  :disabled="!valid"
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
    </v-form>
  </v-app>
</template>

<script>
import About from "@/components/About.vue";
import Response from "@/components/Response.vue";
import RequestHistoryDialog from "@/components/RequestHistoryDialog.vue";
import RequestFiles from "./components/RequestFiles.vue";
import RequestHeaders from "./components/RequestHeaders.vue";
import RequestFields from "./components/RequestFields.vue";

const {
  VUE_APP_TARGET_URL = "",
  VUE_APP_FILES = "",
  VUE_APP_FIELDS = "",
  VUE_APP_HEADERS = "",
} = process.env;

const defaultFiles = [{ file: null, field_name: "image" }];

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
      valid: false,

      request: {
        url: "http://localhost:8080/test",

        files: defaultFiles,
        fields: [],
        headers: [],
      },

      posting: false,
      uploadProgress: 0,
      abortController: null,

      url_rules: [
        (v) => !!v || "URL is required",
        (v) => {
          try {
            new URL(v);
            return true;
          } catch {
            return "URL is invalid";
          }
        },
      ],
      snackbar: {
        open: false,
        text: null,
        color: "green",
      },

      request_history: [],

      response: null,

      tab: null,
    };
  },
  mounted() {
    if (VUE_APP_TARGET_URL) {
      this.request.url = VUE_APP_TARGET_URL;

      this.request.files = VUE_APP_FILES
        ? VUE_APP_FILES.split(",").map((field_name) => ({
            file: null,
            field_name,
          }))
        : [];
      this.request.fields = VUE_APP_FIELDS
        ? VUE_APP_FIELDS.split(",").map((field) => {
            const [name, value = ""] = field.split("=", 2);
            return { name, value, readOnly: !!value };
          })
        : [];
      this.request.headers = VUE_APP_HEADERS
        ? VUE_APP_HEADERS.split(",").map((header) => {
            const [key, value = ""] = header.split("=", 2);
            return { key, value, readOnly: !!value };
          })
        : [];
    } else {
      this.load_history();
    }

    if (this.request.files.length === 0) {
      console.warn("misconfigured environment");
    }
  },

  methods: {
    validate() {
      setTimeout(() => {
        this.$refs.form.validate();
      }, 100);
    },

    post_file() {
      if (!this.valid) return;

      this.posting = true;
      this.uploadProgress = 0;

      this.error = null;
      this.abortController = new AbortController();

      if (!VUE_APP_TARGET_URL) this.add_request_to_history();

      const formData = new FormData();

      this.request.files.forEach((item) => {
        formData.append(item.field_name, item.file);
      });

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
      this.request_history.push({
        ...this.request,
        files: this.request.files.map((item) => ({
          file: null,
          field_name: item.field_name,
        })),
      });
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
        const last_item = this.request_history.at(-1);
        if (last_item) {
          this.request = {
            files: defaultFiles,
            fields: [],
            headers: [],
            ...last_item,
          };
        }
      } catch (error) {
        console.warn(error);
      }
    },

    cancel_upload() {
      this.abortController.abort();
    },
  },

  computed: {
    tabs() {
      if (!VUE_APP_TARGET_URL) {
        return ["FILES", "FIELDS", "HEADERS"];
      } else {
        const tabs = ["FILES"];
        if (VUE_APP_FIELDS) tabs.push("FIELDS");
        if (VUE_APP_HEADERS) tabs.push("HEADERS");

        return tabs;
      }
    },

    url_editable() {
      return !VUE_APP_TARGET_URL;
    },
    files_editable() {
      return !(VUE_APP_TARGET_URL && VUE_APP_FILES);
    },
    fields_editable() {
      return !(VUE_APP_TARGET_URL && VUE_APP_FIELDS);
    },
    headers_editable() {
      return !(VUE_APP_TARGET_URL && VUE_APP_HEADERS);
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

  watch: {
    request: {
      handler() {
        this.validate();
      },
      deep: true,
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
