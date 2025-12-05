import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown, BarChart3, Calendar, CreditCard } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import './App.css'

function App() {
  const [transactions, setTransactions] = useState([])
  const [fixedExpenses, setFixedExpenses] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'alimentacao'
  })
  const [newFixedExpense, setNewFixedExpense] = useState({
    description: '',
    amount: '',
    dueDay: ''
  })

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions')
    const savedFixedExpenses = localStorage.getItem('fixedExpenses')
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
    if (savedFixedExpenses) {
      setFixedExpenses(JSON.parse(savedFixedExpenses))
    }
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('fixedExpenses', JSON.stringify(fixedExpenses))
  }, [fixedExpenses])

  const categories = {
    // Receitas
    salario: 'Salário',
    freelance: 'Freelance',
    investimentos: 'Investimentos',
    outros_receitas: 'Outras Receitas',
    
    // Despesas
    alimentacao: 'Alimentação',
    transporte: 'Transporte',
    lazer: 'Lazer',
    saude: 'Saúde',
    educacao: 'Educação',
    casa: 'Casa/Moradia',
    cartao_credito: 'Cartão de Crédito',
    financiamentos: 'Financiamentos',
    seguros: 'Seguros',
    impostos: 'Impostos',
    vestuario: 'Vestuário',
    tecnologia: 'Tecnologia',
    outros: 'Outros'
  }

  const addTransaction = () => {
    if (newTransaction.description && newTransaction.amount) {
      const transaction = {
        id: Date.now(),
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        date: new Date().toISOString().split('T')[0],
        month: new Date().toISOString().slice(0, 7)
      }
      setTransactions([...transactions, transaction])
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: 'alimentacao'
      })
    }
  }

  const addFixedExpense = () => {
    if (newFixedExpense.description && newFixedExpense.amount && newFixedExpense.dueDay) {
      const expense = {
        id: Date.now(),
        ...newFixedExpense,
        amount: parseFloat(newFixedExpense.amount)
      }
      setFixedExpenses([...fixedExpenses, expense])
      setNewFixedExpense({
        description: '',
        amount: '',
        dueDay: ''
      })
    }
  }

  const removeTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  const removeFixedExpense = (id) => {
    setFixedExpenses(fixedExpenses.filter(e => e.id !== id))
  }

  // Filtrar transações por mês selecionado
  const filteredTransactions = transactions.filter(t => 
    t.month === selectedMonth || t.date?.startsWith(selectedMonth)
  )

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalFixedExpenses = fixedExpenses
    .reduce((sum, e) => sum + e.amount, 0)

  const balance = totalIncome - totalExpenses - totalFixedExpenses

  // Dados para gráficos
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = categories[t.category] || t.category
      acc[category] = (acc[category] || 0) + t.amount
      return acc
    }, {})

  const categoryChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalExpenses) * 100).toFixed(1)
  }))

  // Dados mensais para gráfico de linha
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.month || t.date?.slice(0, 7)
    if (!month) return acc
    
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 }
    }
    
    if (t.type === 'income') {
      acc[month].income += t.amount
    } else {
      acc[month].expenses += t.amount
    }
    
    return acc
  }, {})

  const monthlyChartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      ...item,
      balance: item.income - item.expenses,
      monthName: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

  // Obter lista de meses disponíveis
  const availableMonths = [...new Set(transactions.map(t => t.month || t.date?.slice(0, 7)))]
    .filter(Boolean)
    .sort()
    .reverse()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Controle Financeiro
        </h1>

        {/* Seletor de Mês */}
        <div className="mb-6 flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Período de Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.length > 0 ? (
                    availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {new Date(month + '-01').toLocaleDateString('pt-BR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={selectedMonth}>
                      {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Fixas</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {totalFixedExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="fixed">Despesas Fixas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nova Transação</CardTitle>
                <CardDescription>
                  Adicione uma nova entrada ou saída de dinheiro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Supermercado"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({
                        ...newTransaction,
                        description: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => setNewTransaction({
                        ...newTransaction,
                        type: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Entrada</SelectItem>
                        <SelectItem value="expense">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => setNewTransaction({
                        ...newTransaction,
                        category: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addTransaction} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Transação
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações - {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma transação registrada neste período
                    </p>
                  ) : (
                    filteredTransactions
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {categories[transaction.category]} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTransaction(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nova Despesa Fixa</CardTitle>
                <CardDescription>
                  Adicione uma despesa que se repete mensalmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fixed-description">Descrição</Label>
                    <Input
                      id="fixed-description"
                      placeholder="Ex: Aluguel"
                      value={newFixedExpense.description}
                      onChange={(e) => setNewFixedExpense({
                        ...newFixedExpense,
                        description: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fixed-amount">Valor</Label>
                    <Input
                      id="fixed-amount"
                      type="number"
                      placeholder="0.00"
                      value={newFixedExpense.amount}
                      onChange={(e) => setNewFixedExpense({
                        ...newFixedExpense,
                        amount: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-day">Dia do Vencimento</Label>
                    <Input
                      id="due-day"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="5"
                      value={newFixedExpense.dueDay}
                      onChange={(e) => setNewFixedExpense({
                        ...newFixedExpense,
                        dueDay: e.target.value
                      })}
                    />
                  </div>
                </div>
                <Button onClick={addFixedExpense} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Despesa Fixa
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas Fixas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fixedExpenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma despesa fixa registrada
                    </p>
                  ) : (
                    fixedExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-gray-500">
                            Vence todo dia {expense.dueDay}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600">
                            R$ {expense.amount.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFixedExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Gastos por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Gastos por Categoria
                  </CardTitle>
                  <CardDescription>
                    Distribuição dos gastos no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de Barras por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Gastos</CardTitle>
                  <CardDescription>
                    Categorias com maiores gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryChartData.sort((a, b) => b.value - a.value)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Evolução Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
                <CardDescription>
                  Comparativo de entradas, saídas e saldo ao longo dos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, '']} />
                      <Line type="monotone" dataKey="income" stroke="#10B981" name="Entradas" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Gastos" strokeWidth={2} />
                      <Line type="monotone" dataKey="balance" stroke="#3B82F6" name="Saldo" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    Nenhum dado disponível para análise mensal
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo Estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Maior Gasto</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredTransactions.filter(t => t.type === 'expense').length > 0 ? (
                    (() => {
                      const maxExpense = filteredTransactions
                        .filter(t => t.type === 'expense')
                        .reduce((max, t) => t.amount > max.amount ? t : max)
                      return (
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            R$ {maxExpense.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maxExpense.description} - {categories[maxExpense.category]}
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="text-gray-500">Nenhum gasto registrado</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gasto Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredTransactions.filter(t => t.type === 'expense').length > 0 ? (
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {(totalExpenses / filteredTransactions.filter(t => t.type === 'expense').length).toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-gray-500">Nenhum gasto registrado</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredTransactions.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {filteredTransactions.filter(t => t.type === 'income').length} entradas • {filteredTransactions.filter(t => t.type === 'expense').length} saídas
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
