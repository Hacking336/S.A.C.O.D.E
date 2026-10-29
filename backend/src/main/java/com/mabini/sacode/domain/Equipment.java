package com.mabini.sacode.domain;

public class Equipment {

    private Long id;
    private String equipmentCode;
    private String name;
    private String category;
    private String brandModel;
    private String serialNumber;
    private String building;
    private String room;
    private String status;

    public Equipment() {
    }

    public Equipment(Long id, String equipmentCode, String name, String category,
                     String brandModel, String serialNumber, String building,
                     String room, String status) {
        this.id = id;
        this.equipmentCode = equipmentCode;
        this.name = name;
        this.category = category;
        this.brandModel = brandModel;
        this.serialNumber = serialNumber;
        this.building = building;
        this.room = room;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBrandModel() {
        return brandModel;
    }

    public void setBrandModel(String brandModel) {
        this.brandModel = brandModel;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
