<template>
  <div>
    <v-row>
      <v-col cols="auto">
        <v-btn small @click="add_file()">
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
          <v-file-input v-model="item.file" label="file" />
        </v-col>
        <v-col cols="auto">:</v-col>
        <v-col>
          <v-text-field
            v-model="item.field_name"
            label="Field name"
            :rules="field_name_rules"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            icon
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
export default {
  name: "RequestFilesManagement",
  props: {
    value: Array,
  },
  data() {
    return {
      field_name_rules: [(v) => !!v || "Field name is required"],
    };
  },
  methods: {
    add_file() {
      this.files.push({ file: null, field_name: "aa" });
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
