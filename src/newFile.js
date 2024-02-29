export default (await import("vue")).defineComponent({
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
        file_field_name: [""],

        // files: [],
        fields: [],
        headers: [],
      },

      files: [],

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
      tabs: ["Files", "Fields", "Headers"],
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

      this.request.file_field_name.forEach((item, index) => {
        formData.append(item, this.file[index]);
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
});
