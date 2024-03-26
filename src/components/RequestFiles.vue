<template>
  <div>
    <v-row>
      <v-col cols="auto">
        <v-btn small v-if="!files_disabled" @click="add_file()">
          <v-icon left>mdi-plus</v-icon>
          <span>Add file</span>
        </v-btn>
      </v-col>
    </v-row>
    <div>
      <v-row
        v-for="(item, index) in files"
        :key="`file_item_${index}`"
        align="center"
      >
        <v-col>
          <v-file-input
            v-model="item.file"
            label="file"
            :rules="file_rules"
            required
          />
        </v-col>
        <v-col cols="auto">:</v-col>
        <v-col>
          <v-text-field
            v-model="item.field_name"
            label="Field name"
            :rules="field_name_rules"
            required
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            icon
            v-if="!files_disabled"
            @click="delete_file(index)"
            :disabled="files.length === 1"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
const { VUE_APP_TARGET_FILES } = process.env;

export default {
  name: "RequestFilesManagement",
  props: {
    value: Array,
  },
  data() {
    return {
      files_disabled: VUE_APP_TARGET_FILES,

      file_rules: [(v) => !!v || "File is required"],
      field_name_rules: [(v) => !!v || "Field name is required"],
    };
  },
  methods: {
    add_file() {
      this.files.push({ file: null, field_name: "image" });
    },
    delete_file(index) {
      this.files.splice(index, 1);
    },
  },
  computed: {
    files: {
      get() {
        return this.value;
      },
      set(newVal) {
        console.log(newVal);
        this.$emit("input", newVal);
      },
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
}
</style>
