package com.ecotrack.report.design;

import org.knowm.xchart.BitmapEncoder;
import org.knowm.xchart.CategoryChart;
import org.knowm.xchart.CategoryChartBuilder;
import org.knowm.xchart.PieChart;
import org.knowm.xchart.PieChartBuilder;
import org.knowm.xchart.style.Styler;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.awt.Color;

@Service
public class ReportChartService {

    public byte[] generateEmissionsByCategoryChart(Map<String, BigDecimal> data, ReportTheme theme) {
        if (data == null || data.isEmpty()) return null;

        PieChart chart = new PieChartBuilder()
                .width(500)
                .height(300)
                .title("Emissions by Category (kg CO2e)")
                .build();

        chart.getStyler().setLegendVisible(true);
        chart.getStyler().setLegendPosition(Styler.LegendPosition.OutsideE);
        chart.getStyler().setChartBackgroundColor(theme.getCardBackground());
        chart.getStyler().setPlotBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartTitleBoxBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartFontColor(theme.getTextColor());
        chart.getStyler().setSeriesColors(theme.getChartPalette());
        chart.getStyler().setPlotBorderVisible(false);
        chart.getStyler().setToolTipsEnabled(false);

        for (Map.Entry<String, BigDecimal> entry : data.entrySet()) {
            chart.addSeries(entry.getKey(), entry.getValue());
        }

        return exportChartToBytes(chart);
    }

    public byte[] generateGoalsStatusChart(Map<String, Integer> data, ReportTheme theme) {
        if (data == null || data.isEmpty()) return null;

        PieChart chart = new PieChartBuilder()
                .width(400)
                .height(250)
                .title("Goal Distribution")
                .build();

        chart.getStyler().setLegendVisible(true);
        chart.getStyler().setLegendPosition(Styler.LegendPosition.OutsideS);
        chart.getStyler().setChartBackgroundColor(theme.getCardBackground());
        chart.getStyler().setPlotBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartTitleBoxBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartFontColor(theme.getTextColor());
        chart.getStyler().setSeriesColors(theme.getChartPalette());
        chart.getStyler().setPlotBorderVisible(false);

        for (Map.Entry<String, Integer> entry : data.entrySet()) {
            chart.addSeries(entry.getKey(), entry.getValue());
        }

        return exportChartToBytes(chart);
    }

    public byte[] generateEcoScoreTrendChart(Map<String, Integer> data, ReportTheme theme) {
        if (data == null || data.isEmpty()) return null;

        CategoryChart chart = new CategoryChartBuilder()
                .width(500)
                .height(250)
                .title("Eco Score Trend")
                .xAxisTitle("Period")
                .yAxisTitle("Score")
                .build();

        chart.getStyler().setLegendVisible(false);
        chart.getStyler().setChartBackgroundColor(theme.getCardBackground());
        chart.getStyler().setPlotBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartFontColor(theme.getTextColor());
        chart.getStyler().setSeriesColors(new java.awt.Color[]{theme.getPrimaryColor()});
        chart.getStyler().setPlotBorderVisible(false);
        chart.getStyler().setXAxisTicksVisible(true);

        List<String> xData = new ArrayList<>(data.keySet());
        List<Integer> yData = new ArrayList<>(data.values());

        chart.addSeries("Score", xData, yData);

        return exportChartToBytes(chart);
    }

    public byte[] generatePieChart(String title, Map<String, BigDecimal> data, ReportTheme theme) {
        if (data == null || data.isEmpty()) {
            return new byte[0];
        }

        PieChart chart = new PieChartBuilder()
                .width(600).height(400)
                .title(title)
                .build();

        chart.getStyler().setChartBackgroundColor(theme.getCardBackground());
        chart.getStyler().setPlotBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartTitleBoxBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartFontColor(theme.getTextColor());
        chart.getStyler().setLegendPosition(Styler.LegendPosition.OutsideE);
        chart.getStyler().setPlotBorderVisible(false);
        chart.getStyler().setChartTitleBoxVisible(false);
        chart.getStyler().setChartTitleFont(new java.awt.Font("Helvetica", java.awt.Font.BOLD, 16));
        chart.getStyler().setSeriesColors(theme.getChartPalette());

        for (Map.Entry<String, BigDecimal> entry : data.entrySet()) {
            chart.addSeries(entry.getKey(), entry.getValue());
        }

        return exportChartToBytes(chart);
    }

    public byte[] generateBarChart(String title, String xAxisTitle, String yAxisTitle, List<String> categories, List<Number> values, ReportTheme theme) {
        if (categories == null || categories.isEmpty() || values == null || values.isEmpty()) {
            return new byte[0];
        }

        CategoryChart chart = new CategoryChartBuilder()
                .width(800).height(400)
                .title(title)
                .xAxisTitle(xAxisTitle)
                .yAxisTitle(yAxisTitle)
                .build();

        chart.getStyler().setChartBackgroundColor(theme.getCardBackground());
        chart.getStyler().setPlotBackgroundColor(theme.getCardBackground());
        chart.getStyler().setChartFontColor(theme.getTextColor());
        chart.getStyler().setLegendPosition(Styler.LegendPosition.InsideNW);
        chart.getStyler().setPlotGridLinesVisible(false);
        chart.getStyler().setXAxisLabelRotation(45);
        chart.getStyler().setSeriesColors(new java.awt.Color[]{theme.getPrimaryColor()});

        chart.addSeries("Series 1", categories, values);

        return exportChartToBytes(chart);
    }

    private byte[] exportChartToBytes(org.knowm.xchart.internal.chartpart.Chart chart) {
        try {
            return BitmapEncoder.getBitmapBytes(chart, BitmapEncoder.BitmapFormat.PNG);
        } catch (IOException e) {
            throw new RuntimeException("Error generating chart", e);
        }
    }
}
