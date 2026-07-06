# KrishiAI Production Master Dataset - Class Standardization Map

This document maps original source directories to the standardized KrishiAI class schema.

## 🗺️ Crop & Disease Standardization Table

| Dataset | Original Folder Name | Standard Crop | Standard Category / Disease | Ingest Status |
| :--- | :--- | :--- | :--- | :---: |
| Mendeley_15 | `Cashew leaf miner` | **Cashew** | `Miner` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Cashew red rust` | **Cashew** | `Red_Rust` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Cassava brown spot` | **Cassava** | `Brown_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Cassava mosaic` | **Cassava** | `Mosaic_Virus` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Chili Healthy Leaf` | **Chilli** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Chilli Nutrition Deficiency` | **Chilli** | `Nutrient_Deficiency` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Chilli White spot` | **Chilli** | `White_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Citrus Black spot` | **Citrus** | `Black_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Citrus Healthy` | **Citrus** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Citrus canker` | **Citrus** | `Canker` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Cotton Bacterial Blight` | **Cotton** | `Bacterial_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Cotton Curl Virus` | **Cotton** | `Curl_Virus` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Cotton Healthy Leaf` | **Cotton** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Grape___Black_rot` | **Grape** | `Black_Rot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Grape___Leaf_blight` | **Grape** | `Leaf_Blight` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Grape___healthy` | **Grape** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Ground healthy leaf` | **Groundnut** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Ground late leaf spot` | **Groundnut** | `Late_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Ground nutrition deficiency` | **Groundnut** | `Nutrient_Deficiency` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Maize leaf spot` | **Corn** | `Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Maize streak virus` | **Corn** | `Streak_Virus` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Papaya BacterialSpot` | **Papaya** | `Bacterial_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Papaya Healthy` | **Papaya** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Papaya RingSpot` | **Papaya** | `Ring_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Potato Early_Blight` | **Potato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Potato Healthy` | **Potato** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Potato Late_Blight` | **Potato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Rice___Brown_Spot` | **Rice** | `Brown_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Rice___Healthy` | **Rice** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Rice___Leaf_Blast` | **Rice** | `Leaf_Blast` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Soyabean Caterpillar` | **Soybean** | `Caterpillar` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Soyabean Diabrotica speciosa` | **Soybean** | `Diabrotica_speciosa` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Soyabean Healthy` | **Soybean** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `Sugarcane Brown Spot` | **Sugarcane** | `Brown_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Sugarcane Grassy shoot` | **Sugarcane** | `Grassy_Shoot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Sugarcane Healthy Leaves` | **Sugarcane** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Wheat___Brown_Rust` | **Wheat** | `Brown_Rust` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Wheat___Healthy` | **Wheat** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `Wheat___Yellow_Rust` | **Wheat** | `Yellow_Rust` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `healthy_cashew` | **Cashew** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `healthy_cassava` | **Cassava** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `healthy_maize` | **Corn** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_15 | `healthy_tomato` | **Tomato** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `leaf blight_tomato` | **Tomato** | `Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_15 | `septoria leaf spot_tomato` | **Tomato** | `Septoria_Leaf_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Apple Black rot` | **Apple** | `Black_Rot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Apple Healthy` | **Apple** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Apple Scab` | **Apple** | `Apple_Scab` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Bell pepper Bacterial spot` | **Chilli** | `Bacterial_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Bell pepper Healthy` | **Chilli** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Cashew leaf miner` | **Cashew** | `Miner` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Cashew red rust` | **Cashew** | `Red_Rust` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Cassava brown spot` | **Cassava** | `Brown_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Cassava mosaic` | **Cassava** | `Mosaic_Virus` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Cedar apple rust` | **Apple** | `Rust` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Cherry Healthy` | **Cherry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Cherry Powdery mildew` | **Cherry** | `Powdery_Mildew` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Chili Healthy Leaf` | **Chilli** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Chilli Nutrition Deficiency` | **Chilli** | `Nutrient_Deficiency` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Chilli White spot` | **Chilli** | `White_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Citrus Black spot` | **Citrus** | `Black_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Citrus Healthy` | **Citrus** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Citrus canker` | **Citrus** | `Canker` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Citrus greening` | **Citrus** | `Citrus_Greening` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Corn Common rust` | **Corn** | `Rust` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Corn Gray leaf spot` | **Corn** | `Gray_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Corn Healthy` | **Corn** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Corn Northern Leaf Blight` | **Corn** | `Northern_Blight` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Cotton Bacterial Blight` | **Cotton** | `Bacterial_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Cotton Curl Virus` | **Cotton** | `Curl_Virus` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Cotton Healthy Leaf` | **Cotton** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Grape Black Measles` | **Grape** | `Black_Measles` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Grape Black rot` | **Grape** | `Black_Rot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Grape Healthy` | **Grape** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Grape Isariopsis Leaf Spot` | **Grape** | `Isariopsis_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Papaya Anthracnose` | **Papaya** | `Anthracnose` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Papaya BacterialSpot` | **Papaya** | `Bacterial_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Papaya Curl` | **Papaya** | `Curl_Virus` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Papaya Healthy` | **Papaya** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Papaya RingSpot` | **Papaya** | `Ring_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Peach Bacterial spot` | **Peach** | `Bacterial_Spot` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Peach Healthy` | **Peach** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Potato Early blight` | **Potato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Potato Healthy` | **Potato** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Potato Late blight` | **Potato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Soyabean Caterpillar` | **Soybean** | `Caterpillar` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Soyabean Diabrotica speciosa` | **Soybean** | `Diabrotica_speciosa` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Soyabean Healthy` | **Soybean** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Strawberry Healthy` | **Strawberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Strawberry Leaf scorch` | **Strawberry** | `Scorch` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `Sugarcane Banded Chlorosis` | **Sugarcane** | `Banded_Chlorosis` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Brown Spot` | **Sugarcane** | `Brown_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane BrownRust` | **Sugarcane** | `Brown_Rust` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Dried Leaves` | **Sugarcane** | `Dried` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Grassy shoot` | **Sugarcane** | `Grassy_Shoot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Healthy Leaves` | **Sugarcane** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Mosaic` | **Sugarcane** | `Mosaic_Virus` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Pokkah Boeng` | **Sugarcane** | `Pokkah_Boeng` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Red Leaf Spot` | **Sugarcane** | `Red_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Red Rot` | **Sugarcane** | `Red_Rot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Ring Spot` | **Sugarcane** | `Ring_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Sett Rot` | **Sugarcane** | `Sett_Rot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Viral Disease` | **Sugarcane** | `Viral_Disease` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Wilt` | **Sugarcane** | `Wilt` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane Yellow Leaf` | **Sugarcane** | `Yellow` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Sugarcane smut` | **Sugarcane** | `Smut` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Tomato Bacterial spot` | **Tomato** | `Bacterial_Spot` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Tomato Early blight` | **Tomato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Tomato Healthy` | **Tomato** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `Tomato Late blight` | **Tomato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| Mendeley_17 | `healthy_cashew` | **Cashew** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| Mendeley_17 | `healthy_cassava` | **Cassava** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Apple Scab Leaf` | **Apple** | `Apple_Scab` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Apple Scab Leaf` | **Apple** | `Apple_Scab` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Apple leaf` | **Apple** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Apple leaf` | **Apple** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Apple rust leaf` | **Apple** | `Rust` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Apple rust leaf` | **Apple** | `Rust` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Bell_pepper leaf` | **Chilli** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Bell_pepper leaf` | **Chilli** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Bell_pepper leaf spot` | **Chilli** | `Spot` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Bell_pepper leaf spot` | **Chilli** | `Spot` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Blueberry leaf` | **Blueberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Blueberry leaf` | **Blueberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Cherry leaf` | **Cherry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Cherry leaf` | **Cherry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Corn Gray leaf spot` | **Corn** | `Gray_Spot` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Corn Gray leaf spot` | **Corn** | `Gray_Spot` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Corn leaf blight` | **Corn** | `Blight` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Corn leaf blight` | **Corn** | `Blight` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Corn rust leaf` | **Corn** | `Rust` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Corn rust leaf` | **Corn** | `Rust` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Peach leaf` | **Peach** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Peach leaf` | **Peach** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Potato leaf early blight` | **Potato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Potato leaf early blight` | **Potato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Potato leaf late blight` | **Potato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Potato leaf late blight` | **Potato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Raspberry leaf` | **Raspberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Raspberry leaf` | **Raspberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Soyabean leaf` | **Soybean** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Soyabean leaf` | **Soybean** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Squash Powdery mildew leaf` | **Squash** | `Powdery_Mildew` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Squash Powdery mildew leaf` | **Squash** | `Powdery_Mildew` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Strawberry leaf` | **Strawberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Strawberry leaf` | **Strawberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `Tomato Early blight leaf` | **Tomato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato Early blight leaf` | **Tomato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato Septoria leaf spot` | **Tomato** | `Septoria_Leaf_Spot` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato Septoria leaf spot` | **Tomato** | `Septoria_Leaf_Spot` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf` | **Tomato** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf` | **Tomato** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf bacterial spot` | **Tomato** | `Bacterial_Spot` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf bacterial spot` | **Tomato** | `Bacterial_Spot` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf late blight` | **Tomato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf late blight` | **Tomato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf mosaic virus` | **Tomato** | `Mosaic_Virus` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf mosaic virus` | **Tomato** | `Mosaic_Virus` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf yellow virus` | **Tomato** | `Yellow_Leaf_Curl` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato leaf yellow virus` | **Tomato** | `Yellow_Leaf_Curl` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato mold leaf` | **Tomato** | `Leaf_Mold` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `Tomato mold leaf` | **Tomato** | `Leaf_Mold` | ✅ **Priority Crop** (Ingested) |
| PlantDoc | `grape leaf` | **Grape** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `grape leaf` | **Grape** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `grape leaf black rot` | **Grape** | `Black_Rot` | ❌ **Non-Priority** (Excluded) |
| PlantDoc | `grape leaf black rot` | **Grape** | `Black_Rot` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Apple___Apple_scab` | **Apple** | `Apple_Scab` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Apple___Black_rot` | **Apple** | `Black_Rot` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Apple___Cedar_apple_rust` | **Apple** | `Rust` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Apple___healthy` | **Apple** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Blueberry___healthy` | **Blueberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Cherry_(including_sour)___Powdery_mildew` | **Cherry_(including_sour)** | `Powdery_Mildew` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Cherry_(including_sour)___healthy` | **Cherry_(including_sour)** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` | **Corn** | `Cercospora_Leaf_Spot_Gray_Leaf_Spot` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Corn_(maize)___Common_rust_` | **Corn** | `Rust` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Corn_(maize)___Northern_Leaf_Blight` | **Corn** | `Leaf_Blight` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Corn_(maize)___healthy` | **Corn** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Grape___Black_rot` | **Grape** | `Black_Rot` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Grape___Esca_(Black_Measles)` | **Grape** | `Black_Measles` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Grape___Leaf_blight_(Isariopsis_Leaf_Spot)` | **Grape** | `Leaf_Blight` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Grape___healthy` | **Grape** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Orange___Haunglongbing_(Citrus_greening)` | **Orange** | `Citrus_Greening` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Peach___Bacterial_spot` | **Peach** | `Bacterial_Spot` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Peach___healthy` | **Peach** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Pepper,_bell___Bacterial_spot` | **Pepper,_bell** | `Bacterial_Spot` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Pepper,_bell___healthy` | **Pepper,_bell** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Potato___Early_blight` | **Potato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Potato___Late_blight` | **Potato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Potato___healthy` | **Potato** | `Healthy` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Raspberry___healthy` | **Raspberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Soybean___healthy` | **Soybean** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Squash___Powdery_mildew` | **Squash** | `Powdery_Mildew` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Strawberry___Leaf_scorch` | **Strawberry** | `Leaf_Scorch` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Strawberry___healthy` | **Strawberry** | `Healthy` | ❌ **Non-Priority** (Excluded) |
| PlantVillage | `Tomato___Bacterial_spot` | **Tomato** | `Bacterial_Spot` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Early_blight` | **Tomato** | `Early_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Late_blight` | **Tomato** | `Late_Blight` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Leaf_Mold` | **Tomato** | `Leaf_Mold` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Septoria_leaf_spot` | **Tomato** | `Septoria_Leaf_Spot` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Spider_mites Two-spotted_spider_mite` | **Tomato** | `Spider_Mites` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Target_Spot` | **Tomato** | `Target_Spot` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Tomato_Yellow_Leaf_Curl_Virus` | **Tomato** | `Yellow_Leaf_Curl` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___Tomato_mosaic_virus` | **Tomato** | `Mosaic_Virus` | ✅ **Priority Crop** (Ingested) |
| PlantVillage | `Tomato___healthy` | **Tomato** | `Healthy` | ✅ **Priority Crop** (Ingested) |

## 📊 Consolidated Standards Summary

- **Total Standardized Priority Classes:** 49
- **Total Excluded Classes:** 49

### Standardized Priority Classes List:
- `chilli/Bacterial_Spot`
- `chilli/Healthy`
- `chilli/Nutrient_Deficiency`
- `chilli/Spot`
- `chilli/White_Spot`
- `cotton/Bacterial_Blight`
- `cotton/Curl_Virus`
- `cotton/Healthy`
- `groundnut/Healthy`
- `groundnut/Late_Spot`
- `groundnut/Nutrient_Deficiency`
- `papaya/Anthracnose`
- `papaya/Bacterial_Spot`
- `papaya/Curl_Virus`
- `papaya/Healthy`
- `papaya/Ring_Spot`
- `potato/Early_Blight`
- `potato/Healthy`
- `potato/Late_Blight`
- `sugarcane/Banded_Chlorosis`
- `sugarcane/Brown_Rust`
- `sugarcane/Brown_Spot`
- `sugarcane/Dried`
- `sugarcane/Grassy_Shoot`
- `sugarcane/Healthy`
- `sugarcane/Mosaic_Virus`
- `sugarcane/Pokkah_Boeng`
- `sugarcane/Red_Rot`
- `sugarcane/Red_Spot`
- `sugarcane/Ring_Spot`
- `sugarcane/Sett_Rot`
- `sugarcane/Smut`
- `sugarcane/Viral_Disease`
- `sugarcane/Wilt`
- `sugarcane/Yellow`
- `tomato/Bacterial_Spot`
- `tomato/Blight`
- `tomato/Early_Blight`
- `tomato/Healthy`
- `tomato/Late_Blight`
- `tomato/Leaf_Mold`
- `tomato/Mosaic_Virus`
- `tomato/Septoria_Leaf_Spot`
- `tomato/Spider_Mites`
- `tomato/Target_Spot`
- `tomato/Yellow_Leaf_Curl`
- `wheat/Brown_Rust`
- `wheat/Healthy`
- `wheat/Yellow_Rust`
