package com.skt.product_service.model;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Locale;

public enum ProductCategory {

    // ===== PRE-BUILT SYSTEMS =====
    BASE,
    DESKTOP_PREBUILT,
    LAPTOP,
    WORKSTATION,
    COMPUTER,

    // ===== CORE PC COMPONENTS =====
    CPU,
    GPU,
    MOTHERBOARD,
    RAM,
    STORAGE_SSD,
    STORAGE_HDD,
    POWER_SUPPLY,
    CPU_COOLER,
    CABINET_CASE,

    // ===== PC BUILD / CUSTOM =====
    CUSTOM_PC_BUILD,

    // ===== PERIPHERALS =====
    MONITOR,
    KEYBOARD,
    MOUSE,
    HEADSET,
    SPEAKER,
    WEBCAM,
    MICROPHONE,

    // ===== ACCESSORIES =====
    UPS,
    NETWORK_ROUTER,
    NETWORK_SWITCH,
    WIFI_ADAPTER,
    BLUETOOTH_ADAPTER,
    EXTERNAL_STORAGE,
    USB_HUB,
    CABLES,
    THERMAL_PASTE,

    // ===== GAMING & ADVANCED =====
    GRAPHICS_CARD_EXTERNAL,
    CAPTURE_CARD,
    STREAMING_DEVICE,

    // ===== SOFTWARE =====
    OPERATING_SYSTEM,
    ANTIVIRUS,

    // ===== OTHER =====
    OTHER
    ;

    @JsonCreator
    public static ProductCategory from(String value) {
        return ProductCategory.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}