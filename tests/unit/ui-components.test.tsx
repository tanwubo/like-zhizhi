import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

describe("ui components", () => {
  it("renders a button as a child link while keeping button styles", () => {
    render(
      <Button asChild>
        <a href="/admin/content/carousel/new">新增轮播图</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "新增轮播图" });

    expect(link).toHaveAttribute("href", "/admin/content/carousel/new");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link.className).toContain("bg-blush-600");
  });

  it("provides card composition slots", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>轮播图列表</CardTitle>
          <CardDescription>管理轮播图素材</CardDescription>
        </CardHeader>
        <CardContent>内容</CardContent>
      </Card>
    );

    expect(screen.getByText("轮播图列表")).toHaveAttribute("data-slot", "card-title");
    expect(screen.getByText("管理轮播图素材")).toHaveAttribute("data-slot", "card-description");
  });

  it("provides form, badge and table primitives", () => {
    render(
      <div>
        <Label htmlFor="title">标题</Label>
        <Input id="title" defaultValue="首页轮播" />
        <Textarea aria-label="描述" defaultValue="头部背景" />
        <Badge variant="secondary">启用</Badge>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>素材</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>第一张</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );

    expect(screen.getByLabelText("标题")).toHaveValue("首页轮播");
    expect(screen.getByLabelText("描述")).toHaveValue("头部背景");
    expect(screen.getByText("启用")).toHaveAttribute("data-slot", "badge");
    expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table");
  });
});
