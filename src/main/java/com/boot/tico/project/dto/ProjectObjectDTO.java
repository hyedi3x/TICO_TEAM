package com.boot.tico.project.dto;

import java.sql.Timestamp;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "project_object_tb")
public class ProjectObjectDTO {

	@Id
	private int object_id;
	private int project_id;
	private int object_index;
	private String url;
	private double x;
	private double y;
	private double width;
	private double height;
	private double angle;
	private Boolean hidden;
	private double hue;
	private double brightness;
	private double opacity;
	private int flip_x;
	private int flip_y;
	private String bubble_text;
	private String block_xml;
	private Timestamp created_at;
	public int getObject_id() {
		return object_id;
	}
	public void setObject_id(int object_id) {
		this.object_id = object_id;
	}
	public int getProject_id() {
		return project_id;
	}
	public void setProject_id(int project_id) {
		this.project_id = project_id;
	}
	public int getObject_index() {
		return object_index;
	}
	public void setObject_index(int object_index) {
		this.object_index = object_index;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public double getX() {
		return x;
	}
	public void setX(double x) {
		this.x = x;
	}
	public double getY() {
		return y;
	}
	public void setY(double y) {
		this.y = y;
	}
	public double getWidth() {
		return width;
	}
	public void setWidth(double width) {
		this.width = width;
	}
	public double getHeight() {
		return height;
	}
	public void setHeight(double height) {
		this.height = height;
	}
	public double getAngle() {
		return angle;
	}
	public void setAngle(double angle) {
		this.angle = angle;
	}
	public Boolean getHidden() {
		return hidden;
	}
	public void setHidden(Boolean hidden) {
		this.hidden = hidden;
	}
	public double getHue() {
		return hue;
	}
	public void setHue(double hue) {
		this.hue = hue;
	}
	public double getBrightness() {
		return brightness;
	}
	public void setBrightness(double brightness) {
		this.brightness = brightness;
	}
	public double getOpacity() {
		return opacity;
	}
	public void setOpacity(double opacity) {
		this.opacity = opacity;
	}
	public int getFlip_x() {
		return flip_x;
	}
	public void setFlip_x(int flip_x) {
		this.flip_x = flip_x;
	}
	public int getFlip_y() {
		return flip_y;
	}
	public void setFlip_y(int flip_y) {
		this.flip_y = flip_y;
	}
	public String getBubble_text() {
		return bubble_text;
	}
	public void setBubble_text(String bubble_text) {
		this.bubble_text = bubble_text;
	}
	public String getBlock_xml() {
		return block_xml;
	}
	public void setBlock_xml(String block_xml) {
		this.block_xml = block_xml;
	}
	public Timestamp getCreated_at() {
		return created_at;
	}
	public void setCreated_at(Timestamp created_at) {
		this.created_at = created_at;
	}
	@Override
	public String toString() {
		return "ProjectObjectDTO [object_id=" + object_id + ", project_id=" + project_id + ", object_index="
				+ object_index + ", url=" + url + ", x=" + x + ", y=" + y + ", width=" + width + ", height=" + height
				+ ", angle=" + angle + ", hidden=" + hidden + ", hue=" + hue + ", brightness=" + brightness
				+ ", opacity=" + opacity + ", flip_x=" + flip_x + ", flip_y=" + flip_y + ", bubble_text=" + bubble_text
				+ ", block_xml=" + block_xml + ", created_at=" + created_at + "]";
	}
}
