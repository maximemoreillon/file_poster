<template>
  <div>
    <v-row>
      <v-col cols="auto">
        <v-btn small v-if="editable" @click="add_header()">
          <v-icon left>mdi-plus</v-icon>
          <span>Add header</span>
        </v-btn>
      </v-col>
    </v-row>
    <div v-if="headers.length">
      <v-row
        v-for="(item, index) in headers"
        :key="`header_item_${index}`"
        align="center"
      >
        <v-col>
          <v-text-field
            v-model="item.key"
            placeholder="Key"
            :disabled="!editable"
            :rules="key_rules"
            required
          />
        </v-col>
        <v-col cols="auto">:</v-col>
        <v-col>
          <v-text-field
            v-model="item.value"
            placeholder="Value"
            :disabled="item.readOnly"
            :rules="value_rules"
            required
          />
        </v-col>
        <v-col cols="auto">
          <v-btn icon v-if="editable" @click="delete_header(index)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div v-else>
      <v-row>
        <v-col cols="auto"> No headers </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "RequestHeadersManagement",
  props: {
    value: Array,
    editable: Boolean,
  },
  data() {
    return {
      key_rules: [(v) => !!v || "Key is required"],
      value_rules: [(v) => !!v || "Value is required"],
    };
  },
  methods: {
    add_header() {
      this.headers.push({ key: "", value: "" });
    },
    delete_header(index) {
      this.headers.splice(index, 1);
    },
  },
  computed: {
    headers: {
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
