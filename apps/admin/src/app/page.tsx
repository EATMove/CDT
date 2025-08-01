import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  FileQuestion, 
  BarChart3,
  Settings,
  Plus
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-semibold">加拿大驾考 App 管理面板</h1>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% 较上月
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">题库总数</CardTitle>
              <FileQuestion className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">856</div>
              <p className="text-xs text-muted-foreground">
                AB/BC/ON 三省题库
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">月活用户</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">
                +8% 较上月
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">通过率</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.5%</div>
              <p className="text-xs text-muted-foreground">
                模拟考试平均通过率
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Management */}
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">题库管理</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="handbooks">手册管理</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>题库管理</CardTitle>
                    <CardDescription>
                      管理驾考题目、分类和答案解析
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    添加题目
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  题库管理功能开发中...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>用户管理</CardTitle>
                    <CardDescription>
                      查看和管理用户账户、会员状态
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    导出用户数据
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  用户管理功能开发中...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="handbooks">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>手册管理</CardTitle>
                    <CardDescription>
                      管理驾驶手册内容和章节
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    添加章节
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  手册管理功能开发中...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>数据分析</CardTitle>
                <CardDescription>
                  用户行为分析和学习效果统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  数据分析功能开发中...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
