<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>The World Bank Climate Data API</v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="12" md="10">
          <v-card flat>
            <v-card-text>
              <h3>REST Endpoint</h3>
              <pre>{{endpoint}}/{{parameters}}</pre>
              <v-form v-model="valid" ref="formRef">
                <v-row>
                  <v-col sm="12" md="4">
                    <v-select
                      v-model="parametersData[0]"
                      :items="kinds"
                      label="Kind"
                      :disabled="loading"
                      required
                      :rules="[v => !!v || 'This field is required']"
                    />
                  </v-col>
                  <v-col sm="12" md="4">
                    <v-select
                      v-model="parametersData[1]"
                      :items="types"
                      label="Type"
                      :disabled="loading"
                      required
                      :rules="[v => !!v || 'This field is required']"
                    />
                  </v-col>
                  <v-col sm="12" md="4">
                    <v-select
                      v-model="parametersData[2]"
                      :items="vars"
                      label="Var"
                      :disabled="loading"
                      required
                      :rules="[v => !!v || 'This field is required']"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col sm="12" md="4">
                    <v-radio-group :disabled="loading" v-model="pastOrFuture" row>
                      <v-radio value="past" label="Past"></v-radio>
                      <v-radio value="future" label="Future"></v-radio>
                    </v-radio-group>
                    <v-select
                      v-if="pastOrFuture === 'past'"
                      v-model="pastModel"
                      label="Past"
                      :items="pasts"
                      :disabled="loading"
                      required
                      :rules="[v => !!v || 'This field is required']"
                    >
                      <template slot="item" slot-scope="props">
                        <span>{{props.item.start}} - {{props.item.end}}</span>
                      </template>
                      <template slot="selection" slot-scope="props">
                        <pre>{{props.item.start}} - {{props.item.end}}</pre>
                      </template>
                    </v-select>
                    <v-select
                      v-if="pastOrFuture === 'future'"
                      v-model="futureModel"
                      label="Future"
                      :items="future"
                      :disabled="loading"
                      required
                      :rules="[v => !!v || 'This field is required']"
                    >
                      <template slot="item" slot-scope="props">
                        <span>{{props.item.start}} - {{props.item.end}}</span>
                      </template>
                      <template slot="selection" slot-scope="props">
                        <span>{{props.item.start}} - {{props.item.end}}</span>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="6">
                    <v-autocomplete :disabled="loading" v-model="countryModel" label="Country ISO" :items="countries" :rules="[v => !!v || 'This field is required']"/>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-divider/>
            <v-card-actions>
              <v-spacer/>
              <v-btn @click="getData" x-large depressed color="primary" :disabled="loading" :loading="loading">
                Fetch Data
              </v-btn>
              <v-btn depressed x-large @click="result = null" :disabled="loading">Reset</v-btn>
            </v-card-actions>
            <v-divider/>
            <v-card-text v-if="loading" class="pa-0">
              <v-progress-linear indeterminate/>
            </v-card-text>
            <v-card-text style="overflow: auto;" v-if="result && !loading">
              <v-simple-table width="100%">
                <thead>
                  <tr>
                    <th v-for="(item, key) in result[0]" :key="key">{{key | start-case}}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, key) in result" :key="key">
                    <td v-for="(item2, key2) in result[key]" :key="key2">{{item2}}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import * as constants from '../constants';
import _ from 'lodash';
import { format } from 'date-fns';
export default {
  filters: {
    startCase (str) {
      return _.startCase(str);
    }
  },
  data () {
    return {
      loading: false,
      valid: false,
      endpoint: constants.API_ENDPOINT,
      kinds: constants.KINDS,
      types: constants.PARAM_TYPES,
      vars: constants.PARAM_VARS,
      pasts: constants.PARAM_PAST,
      future: constants.PARAM_FUTURE,
      countries: constants.PARAM_COUNTRY_ISOS,
      exts: constants.PARAM_EXTS,
      parametersData: [],
      pastOrFuture: 'past',
      pastModel: {},
      futureModel: {},
      countryModel: '',
      extModel: '',
      result: null
    }
  },
  computed: {
    parameters () {
      if (!this.parametersData.length) return '';
      return this.parametersData.join('/');
    }
  },
  methods: {
    async getData () {
      try {
        const valid = this.$refs.formRef.validate();
        if (!valid) return;
        this.loading = true;
        const res = await fetch(`${this.endpoint}/${this.parameters}`);
        const data = await res.json();
        this.result = _.map(data, item => {
          return _.omit({
            ...item,
            ...this.parseMonthsValue(item.monthVals)
          }, ['monthVals']);
        });
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    parseMonthsValue (vals) {
      const months = {};
      _.forEach(vals, (val, index) => {
        const date = new Date().setMonth(index);
        months[[format(date, 'MMMM')]] = val;
      });
      return months;
    }
  },
  watch: {
    pastModel (val) {
      this.$set(this.parametersData, 3, val.start);
      this.$set(this.parametersData, 4, val.end);
    },
    futureModel (val) {
      this.$set(this.parametersData, 3, val.start);
      this.$set(this.parametersData, 4, val.end);
    },
    countryModel (val) {
      this.$set(this.parametersData, 5, val);
    }
  }
};
</script>
