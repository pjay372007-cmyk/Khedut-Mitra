import 'dart:convert';
import 'package:flutter/services.dart';

/// Structured disease detail model populated from offline metadata assets.
class DiseaseDetail {
  final String id;
  final String crop;
  final String name;
  final String scientificName;
  final String symptoms;
  final String causes;
  final String organicTreatment;
  final String chemicalTreatment;
  final String fertilizerRecommendation;
  final String prevention;
  final int severity;
  final List<String> region;
  final String season;

  DiseaseDetail({
    required this.id,
    required this.crop,
    required this.name,
    required this.scientificName,
    required this.symptoms,
    required this.causes,
    required this.organicTreatment,
    required this.chemicalTreatment,
    required this.fertilizerRecommendation,
    required this.prevention,
    required this.severity,
    required this.region,
    required this.season,
  });

  factory DiseaseDetail.fromJson(Map<String, dynamic> json, String langCode) {
    // Select correct localization field
    String nameField = 'disease_name_en';
    String symptomsField = 'symptoms_en';
    
    if (langCode == 'gu') {
      nameField = 'disease_name_gu';
      symptomsField = 'symptoms_gu';
    } else if (langCode == 'hi') {
      nameField = 'disease_name_hi';
      symptomsField = 'symptoms_hi';
    }

    // Try new dynamic nested structure fields
    String resolvedName = json[nameField] ?? '';
    if (resolvedName.isEmpty && json['disease_name'] != null) {
      if (json['disease_name'] is Map) {
        if (langCode == 'gu') {
          resolvedName = json['disease_name']['gujarati'] ?? '';
        } else if (langCode == 'hi') {
          resolvedName = json['disease_name']['hindi'] ?? '';
        } else {
          resolvedName = json['disease_name']['english'] ?? '';
        }
      } else {
        resolvedName = json['disease_name'].toString();
      }
    }
    if (resolvedName.isEmpty) {
      resolvedName = json['name'] ?? json['disease'] ?? '';
    }

    String resolvedSymptoms = json[symptomsField] ?? '';
    if (resolvedSymptoms.isEmpty && json['symptoms'] != null) {
      if (json['symptoms'] is Map) {
        if (langCode == 'gu') {
          resolvedSymptoms = json['symptoms']['gujarati'] ?? '';
        } else if (langCode == 'hi') {
          resolvedSymptoms = json['symptoms']['hindi'] ?? '';
        } else {
          resolvedSymptoms = json['symptoms']['english'] ?? '';
        }
      } else if (json['symptoms'] is List) {
        resolvedSymptoms = (json['symptoms'] as List).join(', ');
      } else {
        resolvedSymptoms = json['symptoms'].toString();
      }
    }

    // Standardize treatments
    String resolvedChem = json['chemical_treatment'] ?? '';
    if (resolvedChem.isEmpty && json['chemicalDose'] != null) {
      resolvedChem = json['chemicalDose'].toString();
    }
    
    String resolvedPrev = json['prevention'] ?? '';
    if (resolvedPrev.isEmpty && json['preventive'] != null) {
      resolvedPrev = json['preventive'].toString();
    }

    // Standardize region list
    List<String> resolvedRegion = [];
    if (json['region'] is List) {
      resolvedRegion = List<String>.from(json['region']);
    } else if (json['region'] is String) {
      resolvedRegion = [json['region']];
    }

    return DiseaseDetail(
      id: json['disease_id'] ?? json['id'] ?? '',
      crop: json['crop'] is List ? (json['crop'] as List).join(', ') : (json['crop'] ?? ''),
      name: resolvedName,
      scientificName: json['scientific_name'] ?? (json['disease_name'] is Map ? json['disease_name']['scientific'] : '') ?? '',
      symptoms: resolvedSymptoms,
      causes: json['causes'] is List ? (json['causes'] as List).join(', ') : (json['causes'] ?? ''),
      organicTreatment: json['organic_treatment'] is List ? (json['organic_treatment'] as List).join(', ') : (json['organic_treatment'] ?? ''),
      chemicalTreatment: resolvedChem,
      fertilizerRecommendation: json['fertilizer_recommendation'] ?? json['government_recommendation'] ?? '',
      prevention: resolvedPrev,
      severity: json['severity'] is int ? json['severity'] : 3,
      region: resolvedRegion,
      season: json['season'] ?? '',
    );
  }
}

/// Offline Knowledge base search and advisory service for KrishiAI.
class KrishiAIKnowledgeBaseService {
  List<Map<String, dynamic>> _rawMetadata = [];
  bool _isInitialized = false;

  bool get isInitialized => _isInitialized;

  /// Loads and parses the bundled local JSON metadata mapping database.
  Future<void> initialize(String assetPath) async {
    try {
      final String jsonString = await rootBundle.loadString(assetPath);
      final List<dynamic> data = json.decode(jsonString);
      _rawMetadata = data.cast<Map<String, dynamic>>();
      _isInitialized = true;
      print('[INFO] Knowledge base initialized with ${_rawMetadata.length} advisory files.');
    } catch (e) {
      print('[ERROR] Failed to load offline knowledge base: $e');
      _rawMetadata = [];
      _isInitialized = false;
    }
  }

  /// Looks up localized details for a given disease label under selected language code ('en', 'gu', 'hi').
  DiseaseDetail? getDiseaseDetails(String diseaseNameEnglish, {String langCode = 'en'}) {
    if (!_isInitialized) {
      print('[WARNING] Knowledge base service is not initialized.');
      return null;
    }

    for (final item in _rawMetadata) {
      final String nameEn = item['disease_name_en'] ?? item['name'] ?? (item['disease_name'] is Map ? item['disease_name']['english'] : '') ?? '';
      // Case-insensitive lookup match
      if (nameEn.trim().toLowerCase() == diseaseNameEnglish.trim().toLowerCase()) {
        return DiseaseDetail.fromJson(item, langCode);
      }
    }
    return null;
  }

  /// Lists all registered diseases for a specific crop.
  List<DiseaseDetail> getDiseasesForCrop(String cropName, {String langCode = 'en'}) {
    return _rawMetadata
        .where((item) {
          final cropVal = item['crop'];
          if (cropVal is List) {
            return cropVal.any((c) => c.toString().toLowerCase() == cropName.toLowerCase());
          }
          return cropVal.toString().toLowerCase() == cropName.toLowerCase();
        })
        .map((item) => DiseaseDetail.fromJson(item, langCode))
        .toList();
  }
}
