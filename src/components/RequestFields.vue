<template>
    <div>
        <v-row>
            <v-col cols="auto">
                <v-btn small @click="add_field()">
                    <v-icon left>mdi-plus</v-icon>
                    <span>Add field</span>
                </v-btn>
            </v-col>
        </v-row>
        <table v-if="fields.length">
            <tr v-for="(item, index) in fields" :key="`header_item_${index}`">
                <td>
                    <v-text-field v-model="item.name" placeholder="Key" />
                </td>
                <td>:</td>
                <td>
                    <v-text-field v-model="item.value" placeholder="Value" />
                </td>
                <td>
                    <v-btn icon @click="delete_field(index)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </td>
            </tr>
        </table>

        <v-row v-else>
            <v-col cols="auto">
                No fields
            </v-col>
        </v-row>
    </div>
</template>

<script>
export default {
    name: 'RequestHeadersManagement',
    props: {
        value: Array
    },
    methods: {
        add_field() {
            this.fields.push({ name: '', value: '' })
        },
        delete_field(i) {
            this.fields.splice(i, 1)
        },
    },
    computed: {
        fields: {
            get() {
                return this.value
            },
            set(newVal) {
                console.log(newVal)
                this.$emit('input', newVal)
            }
        }
    }
}

</script>

<style scoped>
table {
    width: 100%;
}
</style>