package com.nutrivet.backend.dto;

import java.util.List;

public record ReportTable(String title, List<String> headers, List<List<Object>> rows) {

}