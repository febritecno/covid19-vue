<template>
    <div class="card">
        <div class="card-body" style="min-height: 662px;">
            <content-loader :is-loading="isLoading" @refresh-data="renderChartProvinces">
                <template v-slot:content>
                    <div style="text-align: left;" class="mb-1 horizontal-scroll hide-scroll">
                        <b-button @click="changeCategory('positive')" :variant="activeTab === 'positive'? 'warning': 'outline-secondary'" pill>
                            <fai icon="frown-open"/> Positif
                        </b-button>
                        <b-button @click="changeCategory('died')" :variant="activeTab === 'died'? 'danger': 'outline-secondary'" class="ml-2" pill>
                            <fai icon="dizzy"/> Meninggal
                        </b-button>
                        <b-button @click="changeCategory('recovery')" :variant="activeTab === 'recovery'? 'success': 'outline-secondary'" class="ml-2" pill>
                            <fai icon="grin"/> Sembuh
                        </b-button>
                    </div>
                    <highcharts :options="chartOption"></highcharts>
                    <div class="mt-1">
                        <b-button @click="showAllProvince()" variant="outline-primary" pill>{{showTop10? 'Tampilkan semua provinsi': 'Tampilkan 10 provinsi'}}</b-button>
                    </div>
                </template>
            </content-loader>
        </div>
    </div>
</template>

<script>
    import {
        APIServiceCovidIndonesia
    } from '../../services/APIServiceCovidIndonesia';
    import {Chart} from 'highcharts-vue'
    import ContentLoader from '@/components/ContentLoader';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { library } from '@fortawesome/fontawesome-svg-core'
    import { faDizzy, faFrownOpen, faGrin } from '@fortawesome/free-solid-svg-icons'
    library.add(faDizzy, faFrownOpen, faGrin)

    const apiServiceCovidIndonesia = new APIServiceCovidIndonesia();
    export default {
        name: "TrendGlobalDaily",
        components: {
            ContentLoader, highcharts: Chart, fai: FontAwesomeIcon
        },
        data() {
            return {
                isLoading: true,
                activeTab: 'positive',
                casePositive: [],
                caseDied: [],
                caseRecovery: [],
                showTop10: true,
                chartOption: {
                    chart: { type: 'bar', height: 1000 },
                    title: { style: {'display':  'none'}},
                    xAxis: { categories: [], allowDecimals: false},
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Kasus',
                            align: 'high'
                        },
                        labels: { overflow: 'justify' },
                        allowDecimals: false
                    },
                    tooltip: {
                        valueSuffix: ' Kasus'
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: true,
                                formatter: function() {
                                    return `${this.y} <span style="color: grey">(${this.percentage}%)</span>`;
                                },
                                inside: false,
                                useHTML: true
                            }
                        },
                        series: {
                            borderColor: '#303030',
                        }
                    },
                    legend: {enabled: false},
                    series: [{ name: '', data: [] }],
                    caption: {
                        text: '<b>Catatan:</b><br><em>Kasus positif/meninggal/sembuh yang data asal provinsinya tidak diketahui dimasukan dalam label provinsi <b>Indonesia</b>.</em>'
                    },
                    credits: {
                        text: 'Sumber data.',
                        href: '#'
                    },
                }
            }
        },
        methods: {
            renderChartProvinces() {
                this.isLoading = true
                this.chartOption.credits.href = apiServiceCovidIndonesia.getBaseUrl();
                apiServiceCovidIndonesia.fetchDataPerProvince()
                    .then((response) => {
                        // Copy array
                        this.casePositive = [...response.data.data]
                        this.caseDied = [...response.data.data]
                        this.caseRecovery = [...response.data.data]

                        // Order data by descending
                        this.casePositive.sort((a, b) => {
                            if (a.kasusPosi < b.kasusPosi) return 1;
                            if (a.kasusPosi > b.kasusPosi) return -1;
                            if (a.provinsi > b.provinsi) return 1;
                            if (a.provinsi < b.provinsi) return -1;
                        })
                        this.caseDied.sort((a, b) => {
                            if (a.kasusMeni < b.kasusMeni) return 1;
                            if (a.kasusMeni > b.kasusMeni) return -1;
                            if (a.provinsi > b.provinsi) return 1;
                            if (a.provinsi < b.provinsi) return -1;
                        })
                        this.caseRecovery.sort((a, b) => {
                            if (a.kasusSemb < b.kasusSemb) return 1;
                            if (a.kasusSemb > b.kasusSemb) return -1;
                            if (a.provinsi > b.provinsi) return 1;
                            if (a.provinsi < b.provinsi) return -1;
                        })

                        this.changeCategory('positive')
                    })
                    .catch(error => {console.error(error)})
                    .finally(error => { this.isLoading = false })
            },
            changeCategory(activeTab) {
                this.activeTab = activeTab
                let categories = []
                let dataSeries = []
                let nameSeries = 'Sembuh'
                let chartHeight = 1000
                let total = 0
                let barColor = '#28a745'

                switch (this.activeTab) {
                    case 'positive':
                        total = this.casePositive.reduce(function (acc, obj) { return acc + obj.kasusPosi; }, 0);
                        nameSeries = 'Positif'
                        categories = this.casePositive.map(item => { return item.provinsi })
                        dataSeries = this.casePositive.map(item => {
                            return {name: item.provinsi, y: item.kasusPosi, percentage: (item.kasusPosi/total * 100).toFixed(2)}
                        })
                        barColor = '#ffc107'
                        break;
                    case 'died':
                        total = this.casePositive.reduce(function (acc, obj) { return acc + obj.kasusMeni; }, 0);
                        nameSeries = 'Meningggal'
                        categories = this.caseDied.map(item => { return item.provinsi })
                        dataSeries = this.caseDied.map(item => {
                            return {name: item.provinsi, y: item.kasusMeni, percentage: (item.kasusMeni/total * 100).toFixed(2)}
                        })
                        barColor = '#dc3545'
                        break;
                    default:
                        total = this.casePositive.reduce(function (acc, obj) { return acc + obj.kasusSemb; }, 0);
                        categories = this.caseRecovery.map(item => { return item.provinsi })
                        dataSeries = this.caseRecovery.map(item => {
                            return {name: item.provinsi, y: item.kasusSemb, percentage: (item.kasusSemb/total * 100).toFixed(2)}
                        })
                        break;
                }

                if (this.showTop10) {
                    chartHeight = 500
                    categories = categories.slice(0, 10)
                    dataSeries = dataSeries.slice(0, 10)
                }

                this.chartOption.plotOptions.series.color = barColor
                this.chartOption.chart.height = chartHeight
                this.chartOption.xAxis.categories = categories
                this.chartOption.series = [{name: nameSeries, data: dataSeries}]
            },
            showAllProvince() {
                this.showTop10 = !this.showTop10
                this.changeCategory(this.activeTab)

                // Scroll to the top of chart
                const element = document.getElementById('chart-indonesia')
                const y = element.getBoundingClientRect().top + window.scrollY;
                window.scroll({ top: y, behavior: 'smooth' });
            }
        },
        mounted() {
            this.renderChartProvinces();
        },
    }
</script>

<style scoped>
    /* Scrolling */
    .horizontal-scroll {
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
    }
    .horizontal-scroll:only-child {
        display: inline-block;
    }
    .horizontal-scroll {
        width: 100%;
        -webkit-overflow-scrolling: touch;
    }
    /* End of Scrolling */

    /* Hide Scrolling */
    .hide-scroll::-webkit-scrollbar{
        display: none; /** Chrome */
        -webkit-appearance: none; /** Safari */
    }
    .hide-scroll { scrollbar-width: none; } /** Firefox */
    /* End of Hide Scrolling */
</style>
