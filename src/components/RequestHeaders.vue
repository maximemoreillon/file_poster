<template>
  <div>
    <v-row>
      <v-col cols="auto">
        <v-btn small @click="add_header()">
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
          <v-text-field v-model="item.key" placeholder="Key" />
        </v-col>
        <v-col cols="auto">:</v-col>
        <v-col>
          <v-text-field v-model="item.value" placeholder="Value" />
        </v-col>
        <v-col cols="auto">
          <v-btn icon @click="delete_header(index)">
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
